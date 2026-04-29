import type { Metadata } from "next";
import React from "react";
import InventoryModule from "@/components/inventory/InventoryModule";

export const metadata: Metadata = {
  title: "Inventario | Mi Crepería",
  description: "Módulo de Inventario de insumos",
};

export default function InventoryPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-2 px-2 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-sm text-gray-500">Consulta los insumos, compras (entradas) y salidas.</p>
        </div>
      </div>
      <div className="w-full">
        <InventoryModule />
      </div>
    </div>
  );
}
