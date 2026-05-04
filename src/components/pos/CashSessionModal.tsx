"use client";
import React, { useState } from "react";
import { useCash } from "@/context/CashContext";
import { useToast } from "@/context/ToastContext";
import { Wallet, ArrowRight, Loader2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export default function CashSessionModal() {
  const { activeSession, openSession, loading } = useCash();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  // Si hay una sesión activa o está cargando, no mostramos nada
  if (loading || activeSession) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      setIsOpening(true);
      await openSession(Number(amount));
    } catch (err) {
      showToast("Error", "Error al abrir la caja", "error");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Apertura de Caja</h3>
            <p className="text-brand-100 text-sm mt-2">
              Inicia tu turno registrando el monto inicial disponible en efectivo.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Monto Inicial (Sencillo)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
              <input 
                type="number" 
                step="0.01"
                autoFocus
                className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-lg"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <p className="text-[10px] text-gray-500 italic px-1">
              * Este monto servirá de base para calcular el arqueo final.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isOpening || !amount}
            className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {isOpening ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                Comenzar Turno
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
