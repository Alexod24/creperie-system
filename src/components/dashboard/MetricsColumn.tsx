"use client";
import React, { useState, useEffect } from "react";
import { ArrowUpRight, AlertTriangle, ShoppingBag, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";

const MetricsColumn: React.FC = () => {
  const [metrics, setMetrics] = useState({
    monthlySales: 0,
    monthlyIncome: 0,
    criticalIngredients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      console.log("MetricsColumn: Starting fetch...");
      setLoading(true);
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      // 1. Monthly Sales count
      const { count: salesCount } = await supabaseQuery(
        () => supabase
          .from("sales")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth),
        0,
        "sales-count"
      );

      // 2. Monthly Income sum
      const { data: incomeData } = await supabaseQuery(
        () => supabase
          .from("sales")
          .select("total")
          .gte("created_at", startOfMonth),
        0,
        "monthly-income"
      );
      
      const totalIncome = incomeData?.reduce((sum: any, s: any) => sum + s.total, 0) || 0;

      // 3. Critical Ingredients count
      const { data: ingredients } = await supabaseQuery(
        () => supabase
          .from("ingredients")
          .select("current_stock, min_stock"),
        0,
        "critical-ingredients"
      );
      
      const criticalCount = ingredients?.filter((i: any) => i.current_stock <= i.min_stock).length || 0;

      setMetrics({
        monthlySales: salesCount || 0,
        monthlyIncome: totalIncome,
        criticalIngredients: criticalCount
      });
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas este Mes</h3>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? "..." : metrics.monthlySales}
          </span>
          <span className="flex items-center text-sm font-medium text-green-500">
            Transacciones
          </span>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del Mes</h3>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? "..." : `S/ ${metrics.monthlyIncome.toFixed(2)}`}
          </span>
          <span className="flex items-center text-sm font-medium text-green-500">
            Total bruto
          </span>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Insumos Críticos</h3>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className={`text-3xl font-semibold ${metrics.criticalIngredients > 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
            {loading ? "..." : metrics.criticalIngredients}
          </span>
          <span className="flex items-center text-sm font-medium text-gray-500">
            Bajo stock
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsColumn;

