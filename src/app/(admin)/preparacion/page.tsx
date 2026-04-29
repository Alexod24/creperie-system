import type { Metadata } from "next";
import React from "react";
import PreparacionModule from "@/components/preparacion/PreparacionModule";

export const metadata: Metadata = {
  title: "Preparación | Mi Crepería",
  description: "Módulo de Preparación de Postres",
};

export default function PreparacionPage() {
  return (
    <div className="w-full h-[calc(100vh-80px)] p-4 sm:p-6 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Preparación en Cocina</h1>
        <p className="text-sm text-gray-500">Registra lo que vas a preparar. Esto aumentará el stock de postres y descontará insumos.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <PreparacionModule />
      </div>
    </div>
  );
}
