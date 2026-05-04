"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { 
  Activity, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Search,
  Filter,
  Package,
  History,
  TrendingUp,
  Clock
} from "lucide-react";

interface Movement {
  id: number;
  movement_type: string;
  quantity: number;
  notes: string;
  created_at: string;
  ingredients: { name: string; unit: string } | null;
  products: { name: string; price: number } | null;
  users: { full_name: string; email: string } | null;
}

export default function MovimientosModule() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"insumos" | "productos">("insumos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseQuery(
        supabase
          .from("inventory_movements")
          .select(`
            id,
            movement_type,
            quantity,
            notes,
            created_at,
            ingredients ( name, unit ),
            products ( name, price ),
            users ( full_name, email )
          `)
          .order("created_at", { ascending: false })
          .limit(100)
      );

      if (error) {
        console.error("Error fetching movements:", error);
      } else {
        const formattedData = (data || []).map((m: any) => ({
          ...m,
          ingredients: Array.isArray(m.ingredients) ? m.ingredients[0] : m.ingredients,
          products: Array.isArray(m.products) ? m.products[0] : m.products,
          users: Array.isArray(m.users) ? m.users[0] : m.users,
        }));
        setMovements(formattedData);
      }
    } catch (err) {
      console.error("Unexpected error fetching movements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter((mov) => {
    const isCorrectType = activeTab === "insumos" ? !!mov.ingredients : !!mov.products;
    const itemName = activeTab === "insumos" ? mov.ingredients?.name : mov.products?.name;
    const matchesSearch = itemName?.toLowerCase().includes(searchTerm.toLowerCase());
    return isCorrectType && matchesSearch;
  });

  // Calculate some simple metrics for the header
  const todayMovements = movements.filter(m => 
    new Date(m.created_at).toDateString() === new Date().toDateString()
  ).length;

  const topUser = movements.length > 0 
    ? movements.reduce((acc, m) => {
        const name = m.users?.full_name || m.users?.email || "Sistema";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : null;

  const mostActiveUserName = topUser ? Object.entries(topUser).sort((a, b) => b[1] - a[1])[0][0] : "-";

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hoy</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{todayMovements}</p>
          <p className="text-[10px] text-gray-500 mt-1">Registros procesados hoy</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Auditor</span>
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white truncate" title={mostActiveUserName}>{mostActiveUserName}</p>
          <p className="text-[10px] text-gray-500 mt-1">Usuario más activo</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Entradas</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{movements.filter(m => m.movement_type === 'entrada').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Abastecimiento histórico</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Salidas</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{movements.filter(m => m.movement_type === 'salida' || m.movement_type === 'preparacion').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Deducciones atómicas</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Header with Search & Tabs */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-brand-600" />
                Auditoría de Almacén
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Seguimiento detallado de cada gramo, mililitro y unidad.</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filtrar por nombre..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={fetchMovements}
                className="p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 hover:text-brand-600 transition-all active:scale-95"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex p-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl w-fit border border-gray-100 dark:border-gray-700/50">
            <button 
              onClick={() => setActiveTab("insumos")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === "insumos" 
                ? "bg-white dark:bg-gray-800 text-brand-600 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              MATERIA PRIMA (INSUMOS)
            </button>
            <button 
              onClick={() => setActiveTab("productos")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === "productos" 
                ? "bg-white dark:bg-gray-800 text-brand-600 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              PRODUCTOS TERMINADOS
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Insumo / Producto</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Movimiento</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Cantidad</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Responsable</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                        <Filter className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                      </div>
                      <div>
                        <p className="text-gray-800 dark:text-white font-bold">Sin resultados</p>
                        <p className="text-gray-500 text-sm">No hay registros que coincidan con el filtro.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.map((mov) => {
                const isEntry = mov.movement_type === 'entrada';
                const isDeduction = mov.movement_type === 'salida' || mov.movement_type === 'preparacion';
                const isVenta = mov.movement_type === 'venta';

                return (
                  <tr key={mov.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(mov.created_at).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(mov.created_at).toLocaleDateString("es-PE", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                          {activeTab === 'insumos' ? <Package className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {activeTab === 'insumos' ? mov.ingredients?.name : mov.products?.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isEntry ? 'bg-green-50 dark:bg-green-500/10 text-green-600' :
                        isVenta ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                      }`}>
                        {isEntry ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {mov.movement_type}
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-base font-black ${isEntry ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                          {isEntry ? '+' : '-'}{mov.quantity.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {activeTab === 'insumos' ? mov.ingredients?.unit : 'u'}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                          {(mov.users?.full_name || mov.users?.email || "S")[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {mov.users?.full_name || mov.users?.email || "Sistema"}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <p className="text-[11px] text-gray-500 italic truncate max-w-[150px]" title={mov.notes}>
                        {mov.notes || "Sin observaciones"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Mostrando últimos 100 movimientos</span>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Actualizado: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
