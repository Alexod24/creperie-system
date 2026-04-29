"use client";
import React from "react";
import { Calendar, Filter } from "lucide-react";

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-md text-sm">
          <button className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm rounded-md font-medium">12 months</button>
          <button className="px-3 py-1 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">30 days</button>
          <button className="px-3 py-1 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">7 days</button>
          <button className="px-3 py-1 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">24 hours</button>
        </div>
      </div>
      <div className="flex items-center space-x-3 text-sm">
        <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>28 abr 2026 - 28 abr 2027</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
