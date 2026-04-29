"use client";
import React from "react";
import { ArrowUpRight } from "lucide-react";

const MetricsColumn: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total members</h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">4,862</span>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            9.2%
          </span>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
      
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid members</h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">2,671</span>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            6.6%
          </span>
        </div>
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>

      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email open rate</h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">82%</span>
          <span className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            8.1%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsColumn;
