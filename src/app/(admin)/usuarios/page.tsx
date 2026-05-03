import type { Metadata } from "next";
import React from "react";
import UserList from "@/components/user-profile/UserList";

export const metadata: Metadata = {
  title: "Usuarios | Mi Crepería",
  description: "Administración de usuarios del sistema",
};

export default function UsuariosPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Usuarios del Sistema</h1>
        <p className="text-sm text-gray-500">Visualiza el equipo de trabajo y administra los accesos.</p>
      </div>
      <div className="flex-1">
        <UserList />
      </div>
    </div>
  );
}
