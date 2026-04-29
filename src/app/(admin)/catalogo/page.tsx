import type { Metadata } from "next";
import React from "react";
import CatalogoModule from "@/components/catalogo/CatalogoModule";

export const metadata: Metadata = {
  title: "Catálogo | Mi Crepería",
  description: "Módulo de Catálogo de Productos",
};

export default function CatalogoPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-2 px-2 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Catálogo de Productos</h1>
          <p className="text-sm text-gray-500">Gestiona los postres que ofreces y revisa su stock disponible.</p>
        </div>
      </div>
      <div className="w-full">
        <CatalogoModule />
      </div>
    </div>
  );
}
