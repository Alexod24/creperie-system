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
    
    // 1. Verificar sesión inicial inmediatamente
    const checkInitialSession = async () => {
      try {
        console.log("Verificando sesión inicial de forma proactiva...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && isMounted) {
          console.log("Sesión inicial encontrada:", session.user.email);
          setUser(session.user);
          // Intentar cargar el rol de inmediato
          const { data: roleData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (isMounted) setRole(roleData?.role || null);
        } else {
          console.log("No se encontró sesión inicial activa.");
        }
      } catch (err) {
        console.error("Error en verificación inicial de sesión:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkInitialSession();

    // 2. Escuchar cambios de autenticación proactivamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("Evento de Autenticación Detectado:", event);
        console.log("Sesión de Supabase:", session ? "Activa" : "Nula");
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log("Usuario autenticado:", currentUser.email);
          try {
            console.log("Obteniendo rol para usuario:", currentUser.id);
            const { data, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', currentUser.id)
              .single();
            
            if (error) {
              console.error("Error al obtener rol desde tabla 'users':", error.message);
            }

            if (isMounted) {
              console.log("Rol obtenido:", data?.role || "Ninguno");
              setRole(data?.role || null);
            }
          } catch (err) {
            console.error("Excepción al buscar rol:", err);
            if (isMounted) setRole(null);
          }
        } else {
          console.log("No hay usuario autenticado.");
          setRole(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Timeout de seguridad: Si después de 3 segundos sigue cargando, liberamos el gate
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("ADVERTENCIA: La verificación de sesión tardó demasiado. Forzando entrada...");
        setLoading(false);
      }
    }, 3000);

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
      console.log("Evaluando redirección - Usuario:", user ? user.email : "Nulo", "| Pathname:", pathname);
      if (!user && pathname !== "/signin" && pathname !== "/signup") {
        console.log("Usuario no autenticado en ruta protegida. Redirigiendo a /signin");
        router.push("/signin");
      } else if (user && (pathname === "/signin" || pathname === "/signup")) {
        console.log("Usuario autenticado en ruta de auth. Redirigiendo a /");
        router.push("/");
      }
    } else {
      console.log("AuthContext aún cargando...");
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
