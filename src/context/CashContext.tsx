"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "./AuthContext";

type CashSession = {
  id: number;
  user_id: string;
  opened_at: string;
  closed_at: string | null;
  initial_amount: number;
  expected_amount: number | null;
  actual_amount: number | null;
  difference: number | null;
  status: 'open' | 'closed';
  users?: {
    full_name: string;
    email: string;
  };
};

type CashContextType = {
  activeSession: CashSession | null;
  loading: boolean;
  openSession: (amount: number) => Promise<void>;
  closeSession: (actualAmount: number) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const CashContext = createContext<CashContextType | undefined>(undefined);

export const useCash = () => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error("useCash must be used within a CashProvider");
  }
  return context;
};

export const CashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = async (forceLoading = false) => {
    try {
      if (forceLoading || !activeSession) setLoading(true);
      
      if (!user) {
        setActiveSession(null);
        return;
      }

      // Usar supabaseQuery con factory para mayor estabilidad
      const { data } = await supabaseQuery<any>(
        () => supabase
          .from("cash_sessions")
          .select(`
            *,
            users (
              full_name,
              email
            )
          `)
          .eq("status", "open")
          .maybeSingle(),
        0,
        "fetch-active-session"
      );

      if (data) {
        setActiveSession(data);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error("Error fetching active session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Solo re-inicializar si el usuario cambia de verdad (ID)
  useEffect(() => {
    if (user?.id) {
      // Cargamos la sesión sin forzar estado de carga global si ya hay datos
      fetchActiveSession();
    } else {
      setActiveSession(null);
      setLoading(false);
    }
  }, [user?.id]);

  const openSession = async (amount: number) => {
    if (!user) return;
    try {
      const { data } = await supabaseQuery<any>(
        () => supabase
          .from("cash_sessions")
          .insert({
            user_id: user.id,
            initial_amount: amount,
            status: 'open'
          })
          .select()
          .single(),
        0,
        "open-cash-session"
      );

      if (data) setActiveSession(data);
    } catch (err) {
      console.error("Error opening session:", err);
      throw err;
    }
  };

  const closeSession = async (actualAmount: number) => {
    if (!activeSession) return;
    try {
      // 1. Obtener totales de ventas con desglose
      const { data: totals, error: totalsError } = await supabase.rpc('get_session_totals', {
        p_session_id: activeSession.id
      });
      
      if (totalsError) throw totalsError;

      const salesTotal = totals[0]?.sales_total || 0;
      const cashTotal = totals[0]?.cash_total || 0;
      const yapeTotal = totals[0]?.yape_total || 0;
      
      // EL monto esperado en efectivo es: Fondo Inicial + Ventas en Efectivo
      const expectedAmount = activeSession.initial_amount + cashTotal;
      const difference = actualAmount - expectedAmount;

      // 2. Cerrar sesión guardando el desglose
      const { error } = await supabaseQuery(
        supabase
          .from("cash_sessions")
          .update({
            closed_at: new Date().toISOString(),
            expected_amount: expectedAmount,
            actual_amount: actualAmount,
            difference: difference,
            cash_sales_total: cashTotal,
            yape_sales_total: yapeTotal,
            status: 'closed'
          })
          .eq("id", activeSession.id),
        undefined,
        "close-cash-session"
      );

      if (error) throw error;
      setActiveSession(null);
    } catch (err) {
      console.error("Error closing session:", err);
      throw err;
    }
  };

  return (
    <CashContext.Provider value={{ 
      activeSession, 
      loading, 
      openSession, 
      closeSession, 
      refreshSession: fetchActiveSession 
    }}>
      {children}
    </CashContext.Provider>
  );
};
