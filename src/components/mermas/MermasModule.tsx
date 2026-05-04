
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { 
  Trash2, 
  AlertOctagon, 
  Search, 
  Package, 
  Plus,
  History
} from "lucide-react";
import Button from "@/components/ui/button/Button";

type Ingredient = {
  id: number;
  name: string;
  current_stock: number;
  unit: string;
};

type Merma = {
  id: number;
  ingredient_id: number;
  quantity: number;
  reason: string;
  notes: string;
  created_at: string;
  ingredients: { name: string, unit: string };
  users: { full_name: string };
};

export default function MermasModule() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [selectedIngId, setSelectedIngId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Malogrado");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Ingredients for the select
      const { data: ings } = await supabaseQuery<any>(
        () => supabase.from("ingredients").select("*").order("name"),
        2,
        "fetch-ingredients-mermas"
      );
      if (ings) setIngredients(ings);

      // Fetch Mermas History
      // For now, we try to fetch from 'mermas' table. 
      // If it fails (table not created), we'll show an error or fallback.
      const { data: mData, error } = await supabaseQuery<any>(
        () => supabase
          .from("mermas")
          .select(`
            *,
            ingredients ( name, unit ),
            users ( full_name )
          `)
          .order("created_at", { ascending: false })
          .limit(50),
        2,
        "fetch-mermas-history"
      );
      
      if (mData) setMermas(mData);
    } catch (err) {
      console.error("Error fetching mermas:", err);
      // Fallback: If table doesn't exist, we might want to handle it
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngId || !quantity || !reason) return;

    try {
      setIsSaving(true);
      
      const ing = ingredients.find(i => i.id === parseInt(selectedIngId));
      if (!ing) return;

      // 1. Insertar en tabla de mermas
      const { error: mermaError } = await supabase
        .from("mermas")
        .insert({
          ingredient_id: parseInt(selectedIngId),
          user_id: user?.id,
          quantity: parseFloat(quantity),
          reason: reason,
          notes: notes
        });

      if (mermaError) throw mermaError;

      // 2. Insertar en inventory_movements para descontar stock
      const { error: moveError } = await supabase
        .from("inventory_movements")
        .insert({
          ingredient_id: parseInt(selectedIngId),
          user_id: user?.id,
          movement_type: "merma",
          quantity: parseFloat(quantity),
          notes: `MERMA [${reason}]: ${notes}`
        });

      if (moveError) throw moveError;

      showToast("Merma Registrada", "El inventario ha sido actualizado correctamente.", "success");
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("Error", "No se pudo registrar la merma. Asegúrate de que las tablas existan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedIngId("");
    setQuantity("");
    setReason("Malogrado");
    setNotes("");
  };

  const filteredMermas = mermas.filter(m => 
    m.ingredients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-red-500" />
            Registro de Mermas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Control de desperdicios, productos vencidos y pérdidas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-red-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar Merma
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/20">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-gray-400" />
              Historial de Pérdidas
            </h3>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por insumo o motivo..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/30 dark:bg-gray-900/30 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Fecha</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Insumo</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Cantidad</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Motivo</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Responsable</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-16 bg-gray-50/10"></td>
                  </tr>
                ))
              ) : filteredMermas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No hay registros de mermas.
                  </td>
                </tr>
              ) : (
                filteredMermas.map((merma) => (
                  <tr key={merma.id} className="group hover:bg-red-50/30 dark:hover:bg-red-500/5 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {new Date(merma.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(merma.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{merma.ingredients?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-red-600">-{merma.quantity} {merma.ingredients?.unit}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-[10px] font-black uppercase">
                        {merma.reason}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-500">
                      {merma.users?.full_name || "Usuario"}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-400 italic max-w-[200px] truncate" title={merma.notes}>
                        {merma.notes || "-"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-gradient-to-br from-red-600 to-red-800 text-white relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <AlertOctagon className="w-7 h-7 text-white" />
                  Nueva Merma
                </h3>
                <p className="text-red-100 text-sm mt-2 font-medium">Registra la pérdida de un insumo para ajustar el stock.</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveMerma} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Insumo</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500 font-bold appearance-none cursor-pointer"
                  value={selectedIngId}
                  onChange={(e) => setSelectedIngId(e.target.value)}
                  required
                >
                  <option value="">Elegir Insumo...</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.current_stock} {ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad a Retirar</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500 font-bold appearance-none cursor-pointer"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="Malogrado">Malogrado</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Accidente">Accidente / Caída</option>
                    <option value="Error Preparación">Error Preparación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones</label>
                <textarea 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm min-h-[100px]"
                  placeholder="Detalles sobre por qué se descarta este insumo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  {isSaving ? "Guardando..." : "Confirmar Merma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
