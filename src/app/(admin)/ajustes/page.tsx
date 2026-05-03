import type { Metadata } from "next";
import React from "react";
import SettingsForm from "@/components/common/SettingsForm";

export const metadata: Metadata = {
  title: "Ajustes | Mi Crepería",
  description: "Configuración general del negocio",
};

export default function AjustesPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ajustes del Sistema</h1>
        <p className="text-sm text-gray-500">Configura la información general de tu negocio.</p>
      </div>
      <div className="flex-1 max-w-4xl">
        <SettingsForm />
      </div>
    </div>
  );
}
