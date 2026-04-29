import type { Metadata } from "next";
import React from "react";
import PosModule from "@/components/pos/PosModule";

export const metadata: Metadata = {
  title: "Punto de Venta | Mi Crepería",
  description: "Módulo de Punto de Venta (POS)",
};

export default function PosPage() {
  return (
    <div className="w-full h-[calc(100vh-80px)] p-4 sm:p-6 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Punto de Venta</h1>
        <p className="text-sm text-gray-500">Registra tus ventas rápidamente.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <PosModule />
      </div>
    </div>
  );
}
