import type { Metadata } from "next";
import React from "react";
import SalesList from "@/components/ventas/SalesList";

export const metadata: Metadata = {
  title: "Historial de Ventas | Mi Crepería",
  description: "Historial de todas las ventas realizadas",
};

export default function VentasPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Historial de Ventas</h1>
        <p className="text-sm text-gray-500">Revisa todas las ventas registradas en el POS.</p>
      </div>
      <div className="flex-1">
        <SalesList />
      </div>
    </div>
  );
}
