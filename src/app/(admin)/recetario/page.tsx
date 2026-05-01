import type { Metadata } from "next";
import React from "react";
import RecetarioGrid from "@/components/recetario/RecetarioGrid";

export const metadata: Metadata = {
  title: "Recetario | Mi Crepería",
  description: "Módulo de Recetario de Productos",
};

export default function RecetarioPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-2 px-2 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Recetario</h1>
          <p className="text-sm text-gray-500">Consulta los detalles y recetas de tus productos activos.</p>
        </div>
      </div>
      <div className="w-full">
        <RecetarioGrid />
      </div>
    </div>
  );
}
