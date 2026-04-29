"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Menu } from "lucide-react";

const AppHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      <div className="flex items-center justify-between w-full px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            className="p-2 -ml-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={toggleMobileSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-semibold text-gray-900">Untitled UI</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
