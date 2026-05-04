"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden flex flex-col md:flex-row h-full gap-6 p-6">
      
      {/* Lista de Ventas */}
      <div className={`flex flex-col w-full ${selectedSale ? 'md:w-1/2' : 'w-full'} transition-all duration-500 ease-in-out`}>
        <div className="overflow-x-auto rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-inner bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md">
                <th className="p-5 font-semibold tracking-wide">ID de Venta</th>
                <th className="p-5 font-semibold tracking-wide">Fecha y Hora</th>
                <th className="p-5 font-semibold tracking-wide">Vendedor</th>
                <th className="p-5 font-semibold text-right tracking-wide">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Cargando ventas...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay ventas registradas.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr 
                    key={sale.id} 
                    onClick={() => handleRowClick(sale)}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
                      selectedSale?.id === sale.id 
                        ? 'bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/30 dark:to-gray-800 shadow-sm' 
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800'
                    } border-b border-gray-50 dark:border-gray-800/50`}
                  >
                    <td className="p-5 font-bold text-brand-600 dark:text-brand-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                        #{sale.id}
                      </div>
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-300 font-medium">
                      {new Date(sale.created_at).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-brand-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {(sale.users?.full_name || sale.users?.email || "U")[0].toUpperCase()}
                        </div>
                        {sale.users?.full_name || sale.users?.email || "Usuario Desconocido"}
                      </div>
                    </td>
                    <td className="p-5 font-bold text-gray-900 dark:text-white text-right text-lg">
                      S/ {sale.total.toFixed(2)}
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
        <div className="flex flex-col w-full md:w-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700 p-6 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                Ticket de Venta #{selectedSale.id}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Comprobante Interno</p>
            </div>
            <button 
              onClick={() => setSelectedSale(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-all hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800 p-5 rounded-xl shadow-inner border border-gray-200/50 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha de Operación</p>
              <p className="font-bold text-gray-800 dark:text-white">{new Date(selectedSale.created_at).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>

            <div className="bg-white dark:bg-gray-800/80 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Productos Vendidos</p>
              {loadingItems ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {saleItems.map(item => (
                    <li key={item.id} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-3 last:border-0 last:pb-0 group">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-brand-500 transition-colors">{item.products?.name || 'Producto Desconocido'}</span>
                        <span className="text-sm text-gray-500">{item.quantity} x S/ {item.unit_price.toFixed(2)}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-lg">S/ {item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-6 rounded-2xl shadow-lg shadow-brand-500/20 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <span className="font-medium text-white/90 relative z-10 text-lg">Total Pagado</span>
              <span className="text-3xl font-black relative z-10 tracking-tight">S/ {selectedSale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
