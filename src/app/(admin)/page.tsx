import type { Metadata } from "next";
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MrrChart from "@/components/dashboard/MrrChart";
import MetricsColumn from "@/components/dashboard/MetricsColumn";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentPosts from "@/components/dashboard/RecentPosts";
import TopMembers from "@/components/dashboard/TopMembers";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel principal de control del sistema",
};

export default function Dashboard() {
  return (
    <div className="w-full max-w-6xl mx-auto py-2 px-2 sm:px-6 lg:px-8">
      <DashboardHeader />
      
      {/* Top Metrics & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        <div className="lg:col-span-8">
          <MrrChart />
        </div>
        <div className="lg:col-span-4">
          <MetricsColumn />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 mb-12">
        <div className="lg:col-span-8">
          <RecentPosts />
        </div>
        <div className="lg:col-span-4">
          <TopMembers />
        </div>
      </div>
    </div>
  );
}
