"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchRole = async (userId: string) => {
    try {
      const { data } = await supabase.from('users').select('role').eq('id', userId).single();
      if (data) {
        setRole(data.role);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role", error);
      setRole(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Escuchar cambios de autenticación
    // onAuthStateChange se dispara inmediatamente con el estado actual al suscribirse
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("Auth Event:", event);
        const currentUser = session?.user ?? null;
        
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', currentUser.id)
              .single();
            
            if (isMounted) {
              setRole(data?.role || null);
            }
          } catch (err) {
            console.error("Error fetching role in auth change:", err);
            if (isMounted) setRole(null);
          }
        } else {
          setRole(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Timeout de seguridad: Si después de 5 segundos sigue cargando, liberamos el gate
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth check timed out, forcing loading to false");
        setLoading(false);
      }
    }, 5000);

    // Heartbeat & Refresh: Cada 4 minutos verificamos la sesión para mantener el token fresco
    const heartbeat = setInterval(async () => {
      if (isMounted) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Heartbeat session error:", error.message);
        } else if (session) {
          console.log("Session heartbeat: Active");
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    }, 4 * 60 * 1000);

    // Recuperación Automática: Cuando el usuario vuelve a la pestaña tras estar AFK o en otra pestaña
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMounted) {
        console.log("Tab focused, re-validating session...");
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        } else {
          // Si no hay sesión al volver, redirigimos a login
          setLoading(false);
          setUser(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);


    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
      clearInterval(heartbeat);
    };
  }, []);



  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/signin" && pathname !== "/signup") {
        router.push("/signin");
      } else if (user && (pathname === "/signin" || pathname === "/signup")) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
