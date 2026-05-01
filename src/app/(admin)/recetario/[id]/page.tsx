import React from "react";
import RecetarioDetail from "@/components/recetario/RecetarioDetail";

export const metadata = {
  title: "Detalles del Producto | Mi Crepería",
  description: "Detalles del producto y opciones.",
};

export default function ProductDetailPage() {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <RecetarioDetail />
    </div>
  );
}
