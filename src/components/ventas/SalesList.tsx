"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, User, CreditCard, ChevronRight, Download, Filter, TrendingUp, ShoppingBag, DollarSign, X, RefreshCw } from "lucide-react";

type SaleItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: {
    name: string;
  };
};

type Sale = {
  id: number;
  total: number;
  created_at: string;
  user_id: string;
  users?: {
    full_name: string;
    email: string;
  };
};

export default function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchSales();
    }
  }, [authLoading, user]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseQuery(
        supabase
          .from("sales")
          .select(`
            *,
            users (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
        undefined,
        "fetch-sales"
      );

      if (error) {
        console.error("Error fetching sales:", error);
      }

      if (data) {
        setSales(data);
      }
    } catch (err) {
      console.error("Exception fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };


  const fetchSaleItems = async (saleId: number) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabaseQuery(
        supabase
          .from("sale_items")
          .select(`
            *,
            products (
              name
            )
          `)
          .eq("sale_id", saleId),
        undefined,
        "fetch-sale-items"
      );

      if (error) {
        console.error("Error fetching sale items:", error);
      }

      if (data) {
        setSaleItems(data);
      }
    } catch (err) {
      console.error("Exception fetching sale items:", err);
    } finally {
      setLoadingItems(false);
    }
  };


  const handleRowClick = (sale: Sale) => {
    if (selectedSale?.id === sale.id) {
      setSelectedSale(null);
      setSaleItems([]);
    } else {
      setSelectedSale(sale);
      fetchSaleItems(sale.id);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = 
        sale.id.toString().includes(searchTerm) || 
        (sale.users?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || sale.created_at.startsWith(dateFilter);
      
      return matchesSearch && matchesDate;
    });
  }, [sales, searchTerm, dateFilter]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, s) => acc + s.total, 0);
    return {
      count: filteredSales.length,
      total: total,
      avg: filteredSales.length > 0 ? total / filteredSales.length : 0
    };
  }, [filteredSales]);

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Ventas Totales</p>
              <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">{stats.count}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Ingresos</p>
              <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">S/ {stats.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Promedio</p>
              <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-0.5">S/ {stats.avg.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[32px] border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden flex flex-col md:flex-row h-full gap-6 p-6">
        
        {/* Lista de Ventas */}
        <div className={`flex flex-col w-full ${selectedSale ? 'md:w-3/5' : 'w-full'} transition-all duration-500 ease-in-out gap-4`}>
          
          {/* Barra de Herramientas / Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por ID o vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-11 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-inner bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm h-full max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/80 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[2px] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-5 font-black">ID Ticket</th>
                  <th className="px-8 py-5 font-black">Fecha y Hora</th>
                  <th className="px-8 py-5 font-black">Cajero</th>
                  <th className="px-8 py-5 font-black text-right">Total</th>
                  <th className="px-8 py-5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-5"><div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-full"></div></td>
                    </tr>
                  ))
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag className="w-12 h-12 text-gray-200" />
                        <p className="font-medium">No se encontraron ventas para estos filtros.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr 
                      key={sale.id} 
                      onClick={() => handleRowClick(sale)}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedSale?.id === sale.id 
                          ? 'bg-brand-50/40 dark:bg-brand-500/10' 
                          : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                      } group`}
                    >
                      <td className="px-8 py-5">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-400 transition-colors font-black text-xs">
                          #{sale.id}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {new Date(sale.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            {new Date(sale.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 group-hover:from-brand-500 group-hover:to-purple-600 group-hover:text-white transition-all shadow-sm font-black text-[10px]">
                            {(sale.users?.full_name || sale.users?.email || "U")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {sale.users?.full_name || "Sistema"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`text-base font-black tracking-tight ${selectedSale?.id === sale.id ? 'text-brand-600' : 'text-gray-900 dark:text-white'}`}>
                          S/ {sale.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedSale?.id === sale.id ? 'bg-brand-500 text-white rotate-90' : 'text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 group-hover:text-brand-500 group-hover:translate-x-1'}`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalles de la Venta */}
        {selectedSale && (
          <div className="flex flex-col w-full md:w-2/5 bg-white dark:bg-gray-950 rounded-3xl shadow-2xl border border-brand-100/50 dark:border-brand-900/30 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
            <div className="bg-brand-500 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShoppingBag className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <button 
                    onClick={() => setSelectedSale(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Venta #{selectedSale.id}</h3>
                <p className="text-brand-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Comprobante de Venta Interno</p>
              </div>
            </div>
          
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{new Date(selectedSale.created_at).toLocaleDateString('es-PE', { dateStyle: 'long' })}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hora</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{new Date(selectedSale.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Productos</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {loadingItems ? (
                    <div className="p-8 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-brand-500" /></div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {saleItems.map(item => (
                        <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{item.products?.name}</span>
                            <span className="text-[10px] font-medium text-gray-500">{item.quantity} un. x S/ {item.unit_price.toFixed(2)}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900 dark:text-white">S/ {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Recaudado</span>
                  <span className="text-3xl font-black text-brand-600 dark:text-brand-400 tracking-tighter">S/ {selectedSale.total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10 dark:shadow-none"
                >
                  <Download className="w-4 h-4" />
                  Imprimir Comprobante
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
