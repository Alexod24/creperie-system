"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: any;
  loading: boolean;
  role: string | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Usar refs para tener acceso al estado más reciente en callbacks de eventos
  const userRef = React.useRef<any>(null);
  const loadingRef = React.useRef(true);

  const updateLastActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  }, []);

  // Log inicial para saber dónde estamos renderizando
  if (typeof window === "undefined") {
    console.log("[AUTH-SERVER] Renderizando AuthProvider en el servidor");
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      userRef.current = null;
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/signin";
    }
  };

  // Función unificada para cargar el perfil completo
  const loadFullProfile = async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      setRole(null);
      userRef.current = null;
      return;
    }

    // Si es el mismo usuario que ya tenemos, no hacemos nada
    if (userRef.current?.id === sessionUser.id) return;

    setUser(sessionUser);
    userRef.current = sessionUser;
    updateLastActivity();

    try {
      const { data: roleData } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionUser.id)
        .single();
      
      setRole(roleData?.role || null);
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        loadingRef.current = true;

        // 1. Obtener sesión inicial
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          if (session?.user) {
            await loadFullProfile(session.user);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    initializeAuth();

    // 2. Escuchar cambios de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log(`[AUTH-CLIENT] Evento: ${event} | Usuario: ${session?.user?.email || "ninguno"}`);
      
      if (session?.user) {
        await loadFullProfile(session.user);
      } else {
        setUser(null);
        setRole(null);
        userRef.current = null;
      }

      // Asegurar que loading sea false tras el primer evento
      if (loadingRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, logout }}>
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
