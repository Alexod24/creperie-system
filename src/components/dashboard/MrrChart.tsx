"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { ApexOptions } from "apexcharts";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MrrChart: React.FC = () => {
  const [salesData, setSalesData] = useState<number[]>(new Array(12).fill(0));
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      
      const { data, error } = await supabaseQuery(
        supabase
          .from("sales")
          .select("total, created_at")
          .gte("created_at", startOfYear),
        30000,
        "mrr-fetch-sales"
      );

      if (error) throw error;
      const monthlyTotals = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      let currentMonthSum = 0;

      data?.forEach((sale: any) => {
        const date = new Date(sale.created_at);
        const month = date.getMonth();
        monthlyTotals[month] += sale.total;
        if (month === currentMonthIndex) {
          currentMonthSum += sale.total;
        }
      });

      setSalesData(monthlyTotals);
      setTotalThisMonth(currentMonthSum);
    } catch (err) {
      console.error("Error fetching dashboard sales:", err);
    } finally {
      setLoading(false);
    }
  };


  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      fontFamily: "inherit",
      toolbar: { show: false },
      sparkline: { enabled: false },
      zoom: { enabled: false },
    },
    colors: ["#7c3aed"], // purple-600
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9ca3af", fontSize: "12px", fontFamily: "inherit" },
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: true,
      borderColor: "#f3f4f6", // gray-100
      strokeDashArray: 0,
      position: "back",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (value) => `S/ ${value.toFixed(2)}`,
      },
    },
  };

  const series = [
    {
      name: "Ventas",
      data: salesData,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="mb-2">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas este Mes</h2>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-4xl font-semibold text-gray-900 dark:text-white">
            {loading ? "..." : `S/ ${totalThisMonth.toFixed(2)}`}
          </span>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            Ingresos reales
          </span>
        </div>
      </div>
      <div className="flex-1 w-full -ml-2">
        <ReactApexChart options={options} series={series} type="area" height={250} />
      </div>
    </div>
  );
};

export default MrrChart;

