"use client";
import React, { useState, useEffect } from "react";
import { MoreVertical, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";

const RecentPosts: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      const { data, error } = await supabaseQuery(
        supabase
          .from("sales")
          .select(`
            id,
            total,
            created_at,
            users (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5),
        undefined,
        "fetch-recent-sales"
      );

      if (error) throw error;
      setSales(data || []);

    } catch (err) {
      console.error("Error fetching recent sales:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas recientes</h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm py-4">Cargando...</p>
        ) : sales.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No hay ventas recientes.</p>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Venta #{sale.id}</p>
                  <p className="text-xs text-gray-500">{sale.users?.full_name || sale.users?.email || 'Cajero'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">S/ {sale.total.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentPosts;

