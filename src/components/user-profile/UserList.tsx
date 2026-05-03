"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Exception fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden flex flex-col h-full gap-6 p-6">
      <div className="flex justify-end">
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm backdrop-blur-sm"
        >
          Actualizar Lista
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-inner bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md">
              <th className="p-5 font-semibold tracking-wide">Usuario</th>
              <th className="p-5 font-semibold tracking-wide">Correo Electrónico</th>
              <th className="p-5 font-semibold tracking-wide text-center">Rol</th>
              <th className="p-5 font-semibold tracking-wide text-right">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-16 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-16 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="font-medium">No se encontraron usuarios.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr 
                  key={u.id} 
                  className="hover:bg-brand-50/40 dark:hover:bg-gray-800/60 transition-colors duration-200 group border-b border-gray-50 dark:border-gray-800/50"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {u.full_name ? u.full_name[0].toUpperCase() : u.email[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{u.full_name || 'Sin Nombre'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-600 dark:text-gray-300 font-medium">
                    {u.email}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' 
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50'
                    }`}>
                      {u.role === 'admin' ? 'Administrador' : 'Empleado'}
                    </span>
                  </td>
                  <td className="p-5 text-right text-gray-500 dark:text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
