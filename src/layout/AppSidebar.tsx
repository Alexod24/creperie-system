"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  Search,

  BarChart2,
  Settings,
  X,
  PlayCircle,
  ShoppingCart,
  Utensils,
  Package,
  BookOpen,
  List,
  Users,
  Activity,
  Receipt,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
};

const navItems: NavItem[] = [
  { name: "Punto de Venta (POS)", icon: <ShoppingCart className="w-5 h-5" />, path: "/pos" },
  { name: "Preparación", icon: <Utensils className="w-5 h-5" />, path: "/preparacion" },
  { name: "Inventario", icon: <Package className="w-5 h-5" />, path: "/inventario" },
];

const managementItems: NavItem[] = [
  { name: "Dashboard", icon: <BarChart2 className="w-5 h-5" />, path: "/" },
  { name: "Movimientos", icon: <Activity className="w-5 h-5" />, path: "/movimientos" },
  { name: "Recetario", icon: <BookOpen className="w-5 h-5" />, path: "/recetario" },
  { name: "Catálogo", icon: <List className="w-5 h-5" />, path: "/catalogo" },
  { name: "Ventas", icon: <Receipt className="w-5 h-5" />, path: "/ventas" },
];

const bottomItems: NavItem[] = [
  { name: "Usuarios", icon: <Users className="w-5 h-5" />, path: "/usuarios" },
  { name: "Ajustes", icon: <Settings className="w-5 h-5" />, path: "/ajustes" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [showFeatures, setShowFeatures] = useState(true);

  const renderNav = (items: NavItem[]) => {
    return (
      <ul className="flex flex-col space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? "text-gray-900" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="text-sm">{item.name}</span>
                  )}
                </div>
                {(isExpanded || isHovered || isMobileOpen) && item.badge && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[280px]"
            : isHovered
            ? "w-[280px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div className={`p-4 flex items-center justify-between`}>
        <div className={`flex items-center ${isExpanded || isHovered || isMobileOpen ? 'space-x-3' : ''}`}>
          <div className="relative w-10 h-10 flex-shrink-0">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
              Gustitos del Virrey
            </span>
          )}
        </div>
        
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => toggleSidebar()}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-brand-600 transition-all ${!isExpanded ? 'rotate-180 ml-2' : ''}`}
          title={isExpanded ? "Encoger Sidebar" : "Expandir Sidebar"}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="px-4 mb-4">
          <div className="relative flex items-center w-full h-10 rounded-md border border-gray-300 bg-white overflow-hidden shadow-sm">
            <div className="grid place-items-center h-full w-10 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
              type="text"
              id="search"
              placeholder="Search"
            />
            <div className="absolute right-2 px-1.5 py-0.5 text-[10px] text-gray-400 border border-gray-200 rounded">
              ⌘K
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 px-3 overflow-y-auto no-scrollbar">
        {(isExpanded || isHovered || isMobileOpen) && (
           <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Acciones Rápidas</h3>
        )}
        {renderNav(navItems)}

        {(isExpanded || isHovered || isMobileOpen) && (
           <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Gestión y Control</h3>
        )}
        {renderNav(managementItems)}

        {(isExpanded || isHovered || isMobileOpen) && (
           <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Configuración</h3>
        )}
        {renderNav(bottomItems)}
      </div>

      {/* Bottom Area */}
      <div className="px-3 pb-4 space-y-4">
        {showFeatures && (isExpanded || isHovered || isMobileOpen) && (
          <div className="bg-gray-50 rounded-lg p-4 relative mt-4">
            <button onClick={() => setShowFeatures(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">New features available!</h4>
            <p className="text-sm text-gray-500 mb-3">
              Check out the new dashboard view. Pages now load faster.
            </p>
            <div className="rounded-md overflow-hidden bg-gray-200 relative w-full h-24 mb-3">
              <Image 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60" 
                 alt="New features video" 
                 fill 
                 className="object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-white opacity-90" />
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <button onClick={() => setShowFeatures(false)} className="text-gray-500 font-medium hover:text-gray-700">Dismiss</button>
              <button className="text-purple-600 font-medium hover:text-purple-700">What&apos;s new?</button>
            </div>
          </div>
        )}

        {/* User Profile */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="pt-4 border-t border-gray-200 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand-100 dark:bg-brand-900/50 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-lg shadow-sm">
                  {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden max-w-[130px]">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.user_metadata?.full_name || "Usuario"}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user?.email || "Sin correo"}
                  </span>
                </div>
              </div>
              <button 
                onClick={signOut}
                title="Cerrar sesión"
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
