"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, Package } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";

const TopMembers: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const { data, error } = await supabaseQuery(
        supabase
          .from("ingredients")
          .select("id, name, current_stock, min_stock, unit")
          .order("current_stock", { ascending: true }),
        undefined,
        "fetch-low-stock"
      );

      if (error) throw error;
      
      const filtered = data?.filter((item: any) => item.current_stock <= item.min_stock) || [];
      setLowStockItems(filtered);

    } catch (err) {
      console.error("Error fetching low stock:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertas de Stock Bajo</h2>
      
      <div className="flex flex-col space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm py-4">Cargando...</p>
        ) : lowStockItems.length === 0 ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 text-green-700 dark:text-green-400">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Todo el stock está al día.</span>
          </div>
        ) : (
          lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</span>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Quedan: {item.current_stock} {item.unit}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Mín: {item.min_stock}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopMembers;

