"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MrrChart: React.FC = () => {
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
    },
  };

  const series = [
    {
      name: "MRR",
      data: [12000, 12500, 12800, 13000, 12200, 13100, 12900, 14500, 15000, 14800, 15200, 18880],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="mb-2">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">MRR</h2>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-4xl font-semibold text-gray-900 dark:text-white">$18,880</span>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            7.4%
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
