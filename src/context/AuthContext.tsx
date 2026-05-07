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

  const updateLastActivity = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      // Usar window.location para asegurar un refresco total de estado al salir
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/signin";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const { data: roleData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (isMounted) setRole(roleData?.role || null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log("AuthContext Event:", event, session?.user?.email || "none");
      const currentUser = session?.user ?? null;

      // Solo actualizar si el ID cambia para evitar bucles
      if (user?.id !== currentUser?.id) {
        setUser(currentUser);
        if (currentUser) {
          updateLastActivity();
          const { data: roleData } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          if (isMounted) setRole(roleData?.role || null);
        } else {
          setRole(null);
        }
      }

      if (isMounted && loading) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Mantener dependencias vacías para registro único

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
