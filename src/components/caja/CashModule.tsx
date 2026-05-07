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
  ArrowRight,
  Search,
  Calendar,
  ChevronRight,
  Filter,
  Smartphone,
  Banknote,
  Calculator
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import { supabaseQuery } from "@/lib/supabaseUtils";

export default function CashModule() {
  const { activeSession, closeSession, loading: sessionLoading } = useCash();
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [actualAmount, setActualAmount] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [sessionTotals, setSessionTotals] = useState({ 
    total: 0, 
    cash: 0, 
    yape: 0, 
    count: 0 
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const dateInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeSession) {
      fetchSessionTotals();
    }
    fetchHistory();
  }, [activeSession]);

  const openDatePicker = () => {
    if (dateInputRef.current) {
      try {
        // @ts-ignore
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  const fetchSessionTotals = async () => {
    if (!activeSession) return;
    try {
      const { data } = await supabaseQuery<any>(
        supabase.rpc('get_session_totals', {
          p_session_id: activeSession.id
        }),
        undefined,
        "fetch-session-totals"
      );
      if (data && data[0]) {
        setSessionTotals({
          total: Number(data[0].sales_total),
          cash: Number(data[0].cash_total),
          yape: Number(data[0].yape_total),
          count: Number(data[0].sales_count)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await supabaseQuery<any>(
        supabase
          .from("cash_sessions")
          .select(`
            *,
            users ( full_name, email )
          `)
          .eq("status", "closed")
          .order("closed_at", { ascending: false })
          .limit(50),
        undefined,
        "fetch-cash-history"
      );
      if (data) setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredHistory = history.filter(session => {
    const matchesUser = (session.users?.full_name || session.users?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || session.closed_at.startsWith(dateFilter);
    return matchesUser && matchesDate;
  });

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

      <div className="grid grid-cols-1 gap-8">
        {/* Panel de Control de Sesión */}
        <div>
          {activeSession ? (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border border-green-500/30">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Sesión Activa
                  </div>
                  <h2 className="text-3xl font-black">Turno en Curso</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Operado por <span className="text-brand-400 font-bold">{user?.user_metadata?.full_name || user?.email}</span>
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inicio de Turno</p>
                  <p className="text-xl font-bold">{new Date(activeSession.opened_at).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Fila 1: Bases y Métodos */}
                  <div className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Monto Inicial</p>
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">S/ {activeSession.initial_amount.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Ventas Efectivo</p>
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">S/ {sessionTotals.cash.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-brand-50 dark:bg-brand-500/10 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Ventas Yape</p>
                    </div>
                    <p className="text-lg font-black text-brand-600">S/ {sessionTotals.yape.toFixed(2)}</p>
                  </div>

                  {/* Fila 2: Totales */}
                  <div className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Ventas</p>
                    </div>
                    <p className="text-lg font-black text-amber-600">S/ {sessionTotals.total.toFixed(2)}</p>
                  </div>

                  <div className="md:col-span-2 p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Calculator className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Balance General (Fondo + Ventas)</p>
                        <p className="text-lg font-black text-indigo-600">S/ {(activeSession.initial_amount + sessionTotals.total).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Operaciones</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{sessionTotals.count}</p>
                    </div>
                  </div>
                  
                  {/* Card Principal de Arqueo */}
                  <div className="sm:col-span-2 md:col-span-3 p-8 bg-gradient-to-br from-emerald-600 to-brand-600 rounded-[28px] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden mt-2">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-emerald-200" />
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Monto Esperado en Físico (Efectivo)</p>
                      </div>
                      <h4 className="text-5xl font-black tracking-tighter">S/ {(activeSession.initial_amount + sessionTotals.cash).toFixed(2)}</h4>
                      <p className="text-xs text-emerald-50/80 mt-4 max-w-sm leading-relaxed font-medium">
                        Este es el dinero que debes tener **físicamente** en el cajón. 
                        (Fondo S/ {activeSession.initial_amount.toFixed(2)} + Ventas S/ {sessionTotals.cash.toFixed(2)})
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Wallet className="w-40 h-40 rotate-12" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/40 rounded-[32px] p-8 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Cerrar Caja</h3>
                  </div>
                  
                  <form onSubmit={handleClose} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Efectivo Real en Caja</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg group-focus-within:text-brand-500 transition-colors">S/</span>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          className="w-full pl-12 pr-6 py-5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-black text-2xl"
                          placeholder="0.00"
                          value={actualAmount}
                          onChange={(e) => setActualAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isClosing}
                      className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20"
                    >
                      {isClosing ? "Procesando..." : "Finalizar Turno"}
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest px-4">
                      Al cerrar se calcularán diferencias automáticamente.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-16 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mb-8 rotate-3 shadow-inner">
                <Wallet className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">No hay un turno abierto</h2>
              <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed">Para comenzar a operar, debes abrir caja con un monto inicial desde el punto de venta.</p>
              <Button onClick={() => window.location.href = '/pos'} className="flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-brand-500/20">
                Ir al POS ahora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Historial Detallado de Arqueos */}
        <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden mt-4">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/20">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <History className="w-7 h-7 text-brand-600" />
                Historial de Arqueos
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Auditoría detallada de cada cierre de turno.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar cajero..."
                  className="pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative group">
                <button 
                  onClick={openDatePicker}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors z-10"
                  title="Seleccionar fecha"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <input 
                  ref={dateInputRef}
                  type="date" 
                  className="pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Fecha Cierre</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Responsable</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Inicial</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Esperado</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Real</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Diferencia</th>
                  <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {loadingHistory ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-10 h-20 bg-gray-50/10"></td>
                    </tr>
                  ))
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                      No se registraron arqueos previos.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((session) => {
                    const diff = session.difference || 0;
                    const isPerfect = Math.abs(diff) < 0.01;
                    return (
                      <tr key={session.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div 
                            className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => setDateFilter(session.closed_at.split('T')[0])}
                            title="Filtrar por este día"
                          >
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {new Date(session.closed_at).toLocaleDateString("es-PE", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {new Date(session.closed_at).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 group-hover:from-brand-500 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-sm font-black text-[10px]">
                              {(session.users?.full_name || session.users?.email || "S")[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-600 transition-colors">
                              {session.users?.full_name || "Sistema"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-500">S/ {session.initial_amount.toFixed(2)}</td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-900 dark:text-white">S/ {session.expected_amount.toFixed(2)}</td>
                        <td className="px-8 py-6 text-sm font-black text-gray-900 dark:text-white">S/ {session.actual_amount.toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black tracking-tight ${
                            isPerfect ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 
                            diff > 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' : 
                            'text-red-600 bg-red-50 dark:bg-red-500/10'
                          }`}>
                            {isPerfect ? 'CUADRADO' : (diff > 0 ? `+ S/ ${diff.toFixed(2)}` : `- S/ ${Math.abs(diff).toFixed(2)}`)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cerrada</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
