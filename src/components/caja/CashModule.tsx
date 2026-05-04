"use client";
import React, { useState, useEffect } from "react";
import { useCash } from "@/context/CashContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { supabase } from "@/lib/supabaseClient";
import { 
  Wallet, 
  Lock, 
  History, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Button from "@/components/ui/button/Button";

export default function CashModule() {
  const { activeSession, closeSession, loading: sessionLoading } = useCash();
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [actualAmount, setActualAmount] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [sessionTotals, setSessionTotals] = useState({ total: 0, count: 0 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeSession) {
      fetchSessionTotals();
    }
    fetchHistory();
  }, [activeSession]);

  const fetchSessionTotals = async () => {
    if (!activeSession) return;
    const { data, error } = await supabase.rpc('get_session_totals', {
      p_session_id: activeSession.id
    });
    if (data && data[0]) {
      setSessionTotals({
        total: Number(data[0].sales_total),
        count: Number(data[0].sales_count)
      });
    }
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("cash_sessions")
      .select(`
        *,
        users ( full_name, email )
      `)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setHistory(data);
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualAmount || isNaN(Number(actualAmount))) return;
    
    const isConfirmed = await confirm({
      title: "¿Cerrar Caja?",
      message: "¿Estás seguro de que deseas cerrar la caja? Esta acción no se puede deshacer.",
      type: "warning",
      confirmText: "Cerrar Turno"
    });
    
    if (!isConfirmed) return;

    try {
      setIsClosing(true);
      await closeSession(Number(actualAmount));
      showToast("Caja Cerrada", "La sesión se ha cerrado correctamente.", "success");
      setActualAmount("");
      fetchHistory();
    } catch (err) {
      showToast("Error", "No se pudo cerrar la caja.", "error");
    } finally {
      setIsClosing(false);
    }
  };

  if (sessionLoading) return <div className="p-8 text-center text-gray-500">Cargando información de caja...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Gestión de Caja</h1>
          <p className="text-gray-500 dark:text-gray-400">Control de turnos, arqueos y flujo de efectivo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Control de Sesión */}
        <div className="lg:col-span-2 space-y-6">
          {activeSession ? (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border border-green-500/30">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Sesión Activa
                  </div>
                  <h2 className="text-2xl font-black">Resumen de Turno</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Iniciado por <span className="text-white font-bold">{user?.user_metadata?.full_name || user?.email}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apertura</p>
                  <p className="text-lg font-bold">{new Date(activeSession.opened_at).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Monto Inicial</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">S/ {activeSession.initial_amount.toFixed(2)}</p>
                    </div>
                    <div className="p-5 bg-brand-50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/20">
                      <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Ventas Netas ({sessionTotals.count})</p>
                      <p className="text-2xl font-black text-brand-700 dark:text-brand-400">S/ {sessionTotals.total.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl text-white shadow-lg">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Total Esperado en Caja</p>
                      <p className="text-3xl font-black text-white">S/ {(activeSession.initial_amount + sessionTotals.total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center bg-gray-50/50 dark:bg-gray-900/30 rounded-[24px] p-8 border border-dashed border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-600" />
                    Cerrar Caja
                  </h3>
                  <form onSubmit={handleClose} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Efectivo Real en Caja</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          className="w-full pl-10 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-black text-xl"
                          placeholder="0.00"
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isClosing}
                      className="w-full h-14 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                      {isClosing ? "Cerrando..." : "Finalizar Turno"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No hay caja abierta</h2>
              <p className="text-gray-500 max-w-sm mb-8">Debes iniciar una sesión en el Punto de Venta (POS) para comenzar a registrar movimientos.</p>
              <Button onClick={() => window.location.href = '/pos'} className="flex items-center gap-2 px-8 py-4">
                Ir al POS
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Historial de Cierres */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-600" />
              Últimos Arqueos
            </h3>
            <div className="space-y-4">
              {history.map((session) => {
                const isDifference = Math.abs(session.difference || 0) > 0.01;
                return (
                  <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[120px]">
                          {session.users?.full_name || 'Sistema'}
                        </p>
                        <p className="text-[10px] text-gray-500">{new Date(session.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${isDifference ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isDifference ? 'Con Diferencia' : 'Cuadrado'}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[8px] text-gray-400 uppercase font-black">Efectivo Real</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">S/ {session.actual_amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black ${isDifference ? 'text-red-500' : 'text-gray-400'}`}>
                          {session.difference > 0 ? '+' : ''}{session.difference?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
