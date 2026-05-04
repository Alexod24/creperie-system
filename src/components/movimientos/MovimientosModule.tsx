"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
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
  batch_id: string | null;
  ingredient_id: number | null;
  product_id: number | null;
  ingredients: { name: string; unit: string } | null;
  products: { name: string; price: number } | null;
  users: { full_name: string; email: string } | null;
}

interface GroupedMovement {
  batch_id: string | null;
  timestamp: string;
  type: string;
  user: any;
  notes: string;
  mainItem: string;
  mainQuantity: number;
  unit: string;
  items: Movement[];
  id: number; // For keys
}

export default function MovimientosModule() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"insumos" | "productos">("insumos");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchMovements();
    }
  }, [authLoading, user]);

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
            batch_id,
            ingredient_id,
            product_id,
            ingredients ( name, unit ),
            products ( name, price ),
            users ( full_name, email )
          `)
          .order("created_at", { ascending: false })
          .limit(200)
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

  // Grouping Logic Inteligente (Agrupa por batch_id o por timestamp+usuario para datos antiguos)
  const groupedMovements = React.useMemo(() => {
    const groups: Record<string, GroupedMovement> = {};
    
    movements.forEach((mov) => {
      // Creamos una clave única: Priorizamos batch_id, si no existe usamos timestamp + usuario + tipo
      const timeKey = new Date(mov.created_at).getTime().toString();
      const userKey = mov.users?.email || "sistema";
      const groupKey = mov.batch_id || `${timeKey}_${userKey}_${mov.movement_type}`;

      // Solo agrupamos si es de tipo preparación o si tiene un batch_id
      const shouldGroup = mov.batch_id || mov.movement_type === 'preparacion';

      if (shouldGroup) {
        if (!groups[groupKey]) {
          // Intentar extraer nombre del producto de las notas si no hay product_id
          let fallbackName = mov.notes?.includes("Insumo para ") 
            ? mov.notes.replace("Insumo para ", "") 
            : (mov.notes?.includes("Preparación de ") ? mov.notes.replace("Preparación de ", "") : "Preparación");

          groups[groupKey] = {
            batch_id: mov.batch_id || groupKey,
            timestamp: mov.created_at,
            type: mov.movement_type,
            user: mov.users,
            notes: mov.notes,
            mainItem: mov.products?.name || fallbackName,
            mainQuantity: mov.quantity,
            unit: mov.ingredients?.unit || "u",
            items: [],
            id: mov.id
          };
        }
        
        groups[groupKey].items.push(mov);
        
        // Si encontramos cualquier movimiento con product_id en este grupo, lo usamos como título principal
        if (mov.product_id && mov.products?.name) {
          groups[groupKey].mainItem = mov.products.name;
          groups[groupKey].mainQuantity = mov.quantity;
          groups[groupKey].unit = "u";
          // Forzamos el tipo a entrada para el grupo si hay un producto involucrado
          groups[groupKey].type = "entrada"; 
        }
      } else {
        // Movimientos individuales (entradas/salidas manuales)
        const singleKey = `single_${mov.id}`;
        groups[singleKey] = {
          batch_id: null,
          timestamp: mov.created_at,
          type: mov.movement_type,
          user: mov.users,
          notes: mov.notes,
          mainItem: mov.ingredients?.name || mov.products?.name || "Item",
          mainQuantity: mov.quantity,
          unit: mov.ingredients?.unit || "u",
          items: [mov],
          id: mov.id
        };
      }
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [movements]);

  const filteredGrouped = groupedMovements.filter((group) => {
    const isCorrectType = activeTab === "insumos" 
      ? group.items.some(i => !!i.ingredients) 
      : group.items.some(i => !!i.products);
    
    const matchesSearch = group.mainItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.items.some(i => i.ingredients?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return isCorrectType && matchesSearch;
  });

  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const toggleExpand = (id: string | number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/80 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[2px] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-md">
                <th className="px-8 py-5 font-black">Timestamp</th>
                <th className="px-8 py-5 font-black">Insumo / Producto</th>
                <th className="px-8 py-5 font-black">Movimiento</th>
                <th className="px-8 py-5 font-black">Cantidad</th>
                <th className="px-8 py-5 font-black">Responsable</th>
                <th className="px-8 py-5 font-black">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredGrouped.map((group) => {
                const id = group.batch_id || group.id;
                const isExpanded = expandedId === id;
                const isBatch = !!group.batch_id;
                
                // Determine display type and quantity based on context (Insumos vs Productos)
                let displayType = group.type;
                let displayQuantity = group.mainQuantity;
                let displaySign = "";
                let displayText = "";
                
                if (isBatch) {
                  if (activeTab === "insumos") {
                    displayType = "preparacion";
                    displaySign = ""; 
                    displayText = group.mainItem;
                  } else {
                    displayType = "entrada";
                    displaySign = "+";
                    displayText = group.mainItem;
                  }
                } else {
                  displaySign = group.type === 'entrada' ? "+" : "-";
                  displayText = group.mainItem;
                }

                const isEntry = displayType === 'entrada';
                const isVenta = displayType === 'venta';
                const isPrep = displayType === 'preparacion';

                return (
                  <React.Fragment key={id}>
                    <tr 
                      onClick={() => isBatch && toggleExpand(id)}
                      className={`group transition-all duration-300 ${
                        isBatch ? 'cursor-pointer hover:bg-brand-50/30 dark:hover:bg-brand-500/5' : 'hover:bg-gray-50 dark:hover:bg-gray-900/40'
                      } ${isExpanded ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {new Date(group.timestamp).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            {new Date(group.timestamp).toLocaleDateString("es-PE", { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isBatch ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-800'
                          }`}>
                            {isBatch ? <History className="w-4 h-4" /> : (activeTab === 'insumos' ? <Package className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />)}
                          </div>
                          <div>
                            <span className={`text-sm font-bold block ${isBatch ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white group-hover:text-brand-600'}`}>
                              {displayText}
                            </span>
                            {isBatch && (
                              <span className="text-[9px] text-brand-500/70 font-black uppercase tracking-widest">
                                {isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isEntry ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-200/50' :
                          isVenta ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-200/50' :
                          isPrep ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200/50' :
                          'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200/50'
                        }`}>
                          {isEntry ? <ArrowUpRight className="w-3 h-3" /> : 
                           isVenta ? <ArrowDownRight className="w-3 h-3" /> : 
                           <RefreshCw className="w-3 h-3" />}
                          {displayType}
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-black ${isEntry ? 'text-green-600' : isPrep ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                            {displaySign}{displayQuantity.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {group.unit}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 group-hover:from-brand-500 group-hover:to-purple-600 group-hover:text-white transition-all shadow-sm font-black text-[10px]">
                            {(group.user?.full_name || group.user?.email || "S")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-600 transition-colors">
                            {group.user?.full_name || "Sistema"}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <p className="text-[11px] text-gray-500 italic truncate max-w-[150px]" title={group.notes}>
                          {group.notes || "Sin observaciones"}
                        </p>
                      </td>
                    </tr>

                    {/* Expandable Detail */}
                    {isExpanded && isBatch && (
                      <tr className="bg-gray-50/50 dark:bg-gray-900/20">
                        <td colSpan={6} className="px-8 py-0">
                          <div className="py-6 pl-12 border-l-2 border-brand-500/30 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Desglose de Insumos Utilizados</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {group.items.filter(i => i.movement_type === 'preparacion' || (i.movement_type === 'entrada' && !i.product_id)).map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                                  <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{item.ingredients?.name || "Insumo"}</p>
                                    <p className="text-[9px] text-gray-400">{item.notes}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-red-500">-{item.quantity.toLocaleString()} {item.ingredients?.unit}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
