"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { 
  Plus, 
  Package, 
  ArrowDownRight, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Layers,
  ChevronRight,
  MoreVertical,
  Scale
} from "lucide-react";

type Ingredient = {
  id: number;
  name: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  cost_per_unit: number;
};

export default function InventoryModule() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIng, setSelectedIng] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, role, loading: authLoading } = useAuth();
  
  // Entry States
  const [entryQty, setEntryQty] = useState("");
  const [entryUnit, setEntryUnit] = useState("");
  const [entryCost, setEntryCost] = useState("");

  // Create States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("g");
  const [newMinStock, setNewMinStock] = useState("");
  const [newInitialStock, setNewInitialStock] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchIngredients();
    }
  }, [authLoading, user]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data } = await supabaseQuery<any>(
        () => supabase
          .from("ingredients")
          .select("*")
          .order("name"),
        2,
        "fetch-ingredients"
      );
      
      if (data) setIngredients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: ingredients.length,
    lowStock: ingredients.filter(i => i.current_stock <= i.min_stock && i.current_stock > 0).length,
    outOfStock: ingredients.filter(i => i.current_stock === 0).length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUnit) return;

    try {
      setIsCreating(true);
      
      // 1. Crear el insumo
      const { data, error } = await supabaseQuery<any>(
        supabase
          .from("ingredients")
          .insert({
            name: newName,
            unit: newUnit,
            min_stock: parseFloat(newMinStock) || 0,
            current_stock: parseFloat(newInitialStock) || 0,
            cost_per_unit: parseFloat(newCost) || 0
          })
          .select(),
        undefined,
        "create-ingredient"
      );

      if (error) throw error;

      // 2. Si tiene stock inicial, registrar movimiento
      if (data && data[0] && parseFloat(newInitialStock) > 0) {
        await supabase
          .from("inventory_movements")
          .insert({
            ingredient_id: data[0].id,
            movement_type: "entrada",
            quantity: parseFloat(newInitialStock),
            notes: "Stock inicial al crear insumo"
          });
      }

      setIsCreateModalOpen(false);
      setNewName("");
      setNewMinStock("");
      setNewInitialStock("");
      setNewCost("");
      fetchIngredients();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIng || !entryQty) return;

    let finalQty = parseFloat(entryQty);
    let finalCost = parseFloat(entryCost) || 0;

    if (entryUnit === "kg" || entryUnit === "litros") {
      finalQty = finalQty * 1000;
      finalCost = finalCost / 1000;
    }

    try {
      const { error: moveError } = await supabase
        .from("inventory_movements")
        .insert({
          ingredient_id: selectedIng.id,
          movement_type: "entrada",
          quantity: finalQty,
          notes: `Entrada convertida de ${entryQty} ${entryUnit}`
        });

      if (moveError) throw moveError;

      if (finalCost > 0) {
        await supabase
          .from("ingredients")
          .update({ cost_per_unit: finalCost })
          .eq("id", selectedIng.id);
      }

      setIsModalOpen(false);
      setEntryQty("");
      setEntryCost("");
      fetchIngredients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Insumos</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Bajo</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.lowStock}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agotados</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Header with Search */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Inventario Global</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Control atómico de materias primas e insumos.</p>
            </div>
            {role === 'admin' && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Insumo
              </button>
            )}
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar insumo..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Insumo</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Stock Atómico</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Nivel de Stock</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Costo Base</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">No se encontraron insumos.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredIngredients.map((item) => {
                const stockPercent = Math.min(100, (item.current_stock / (item.min_stock * 3 || 1000)) * 100);
                const isLow = item.current_stock <= item.min_stock;
                const isEmpty = item.current_stock === 0;

                return (
                  <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isEmpty ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 
                          isLow ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' : 
                          'bg-green-50 dark:bg-green-500/10 text-green-500'
                        }`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">ID: #{item.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-gray-900 dark:text-white">{item.current_stock.toFixed(0)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="space-y-2 w-32">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={isEmpty ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-green-500 uppercase'}>
                            {isEmpty ? 'Agotado' : isLow ? 'Crítico' : 'Saludable'}
                          </span>
                          <span className="text-gray-400">{Math.round(stockPercent)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                              isEmpty ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">S/ {item.cost_per_unit?.toFixed(4)}</span>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right">
                      {role === 'admin' && (
                        <button 
                          onClick={() => {
                            setSelectedIng(item);
                            setEntryUnit(item.unit === "g" ? "kg" : item.unit === "ml" ? "litros" : "u");
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/10 dark:shadow-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Comprar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal - Refactored for Premium Look */}
      {isModalOpen && selectedIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Package className="w-7 h-7 text-brand-400" />
                  Nueva Entrada
                </h3>
                <p className="text-gray-400 text-sm mt-2">Registrando abastecimiento para <span className="text-white font-bold">{selectedIng.name}</span></p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Scale className="w-24 h-24" />
              </div>
            </div>
            
            <form onSubmit={handleEntry} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Cantidad</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    placeholder="0.00"
                    value={entryQty}
                    onChange={(e) => setEntryQty(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Unidad</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    value={entryUnit}
                    onChange={(e) => setEntryUnit(e.target.value)}
                  >
                    {selectedIng.unit === 'g' && <><option value="kg">Kilogramos</option><option value="g">Gramos</option></>}
                    {selectedIng.unit === 'ml' && <><option value="litros">Litros</option><option value="ml">Mililitros</option></>}
                    {selectedIng.unit === 'u' && <option value="u">Unidades</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Costo Total de Compra</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    placeholder="0.00"
                    value={entryCost}
                    onChange={(e) => setEntryCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-brand-50 dark:bg-brand-500/10 p-5 rounded-2xl flex gap-4 items-center">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/20">
                  <ArrowDownRight className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs">
                  <p className="text-brand-600 dark:text-brand-400 font-black uppercase tracking-wider">Conversión Atómica</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                    Se añadirán <span className="font-bold text-gray-900 dark:text-white">
                      {entryUnit === 'kg' || entryUnit === 'litros' ? (parseFloat(entryQty || "0") * 1000).toLocaleString() : entryQty || 0} {selectedIng.unit}
                    </span> al inventario base.
                  </p>
                </div>
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
                  className="flex-1 px-6 py-4 bg-brand-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Registrar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Plus className="w-7 h-7 text-white" />
                  Nuevo Insumo
                </h3>
                <p className="text-brand-100 text-sm mt-2 font-medium">Define las propiedades de la nueva materia prima.</p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Layers className="w-24 h-24" />
              </div>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Insumo</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                  placeholder="Ej. Harina Premium"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidad Base</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold appearance-none cursor-pointer"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="u">Unidades (u)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    placeholder="500"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    placeholder="0"
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Costo Unitario</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                    placeholder="0.00"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1 px-6 py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  {isCreating ? "Creando..." : "Crear Insumo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
