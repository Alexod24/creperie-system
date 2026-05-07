"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { loading, user } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);

  // Detectar hidratación
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Log informativo
  const location = typeof window === "undefined" ? "SERVER" : "CLIENT";
  console.log(`[LAYOUT-${location}] AdminLayout - Loading:`, loading, "| User:", user ? user.email : "Nulo");

  // Redirección si no hay usuario (solo en el cliente)
  useEffect(() => {
    if (hasHydrated && !loading && !user) {
      console.log("[LAYOUT-CLIENT] No se encontró usuario, redirigiendo a /signin");
      window.location.href = "/signin";
    }
  }, [loading, user, hasHydrated]);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[280px]"
    : "lg:ml-[80px]";

  // Pantalla de carga inicial o mientras esperamos hidratación/auth
  if (!hasHydrated || (loading && !user)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-gray-900 gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-100 dark:border-brand-900/30"></div>
          <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gustitos del Virrey</h2>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            {!hasHydrated ? "Sincronizando..." : "Verificando identidad..."}
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no mostramos nada mientras redirigimos
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}

