"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, 
  Calendar, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  Clock
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import SaleDetailModal from "./SaleDetailModal";

type Sale = {
  id: number;
  total: number;
  payment_method: string;
  payment_reference: string | null;
  created_at: string;
  users: {
    full_name: string;
  };
};

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
    const controller = new AbortController();
    if (!authLoading && user?.id) {
      fetchSales(controller.signal);
    }
    return () => controller.abort();
  }, [authLoading, user?.id]);

  const fetchSales = async (signal?: AbortSignal) => {
    try {
      console.log("SalesList: fetchSales starting...");
      setLoading(true);
      const { data, error } = await supabaseQuery<any[]>(
        () => supabase
          .from("sales")
          .select(`
            *,
            users ( full_name )
          `)
          .order("created_at", { ascending: false })
          .limit(100),
        0,
        "fetch-sales",
        signal
      );
      if (data) setSales(data);
    } catch (err) {
      console.error("Exception fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetails = async (saleId: number) => {
    setLoadingItems(true);
    try {
      const { data } = await supabaseQuery<any[]>(
        () => supabase
          .from("sale_items")
          .select(`
            *,
            products ( name )
          `)
          .eq("sale_id", saleId),
        0,
        "fetch-sale-details"
      );
      if (data) setSaleItems(data);
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    fetchSaleDetails(sale.id);
  };

  const filteredSales = (Array.isArray(sales) ? sales : []).filter(sale => {
    if (!sale) return false;
    const saleId = sale.id?.toString() || "";
    const reference = sale.payment_reference?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = saleId.includes(searchTerm) || reference.includes(search);
    const matchesDate = !dateFilter || (sale.created_at && sale.created_at.startsWith(dateFilter));
    
    return matchesSearch && matchesDate;
  });

  const totalRevenue = Array.isArray(filteredSales) 
    ? filteredSales.reduce((acc, sale) => acc + sale.total, 0) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Ventas</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredSales.length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Transacciones procesadas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ingresos</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">S/ {totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-gray-500 mt-1">Monto total acumulado</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hoy</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {Array.isArray(filteredSales) 
              ? filteredSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length
              : 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Ventas realizadas hoy</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Historial de Ventas</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Listado cronológico de todas las operaciones.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="ID o Referencia..."
                className="pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all w-full md:w-48 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                className="pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl h-10 px-4">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">ID / Fecha</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Cajero</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Método</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800">Total</th>
                <th className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-16">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-medium italic">
                    No se encontraron ventas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">#{sale.id}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                          {new Date(sale.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          {sale.users?.full_name ? sale.users.full_name[0].toUpperCase() : "?"}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{sale.users?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sale.payment_method === 'yape' 
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' 
                        : 'bg-green-50 dark:bg-green-500/10 text-green-600'
                      }`}>
                        {sale.payment_method}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-base font-black text-gray-900 dark:text-white">S/ {sale.total.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleViewDetails(sale)}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleDetailModal 
        isOpen={!!selectedSale} 
        onClose={() => setSelectedSale(null)} 
        sale={selectedSale}
        items={saleItems}
        loading={loadingItems}
      />
    </div>
  );
}
