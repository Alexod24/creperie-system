"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import UserModal from "./UserModal";
import { UserPlus, Edit2, Trash2, Phone, Clock, Calendar, DollarSign, RefreshCw } from "lucide-react";

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  shift?: string;
  schedule?: string;
  phone?: string;
  entry_date?: string;
  salary?: number;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: "¿Eliminar Empleado?",
      message: `¿Estás seguro de que deseas eliminar el perfil de ${user.full_name || user.email}? Esto lo removerá de la lista administrativa.`,
      confirmText: "Eliminar Perfil",
      cancelText: "Cancelar",
      type: "danger"
    });

    if (confirmed) {
      try {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", user.id);

        if (error) throw error;

        showToast("Éxito", "Perfil de usuario eliminado", "success");
        fetchUsers();
      } catch (error: any) {
        showToast("Error", error.message || "No se pudo eliminar", "error");
      }
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden flex flex-col h-full gap-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Equipo de Trabajo</h2>
        <div className="flex gap-3">
            <button
              onClick={fetchUsers}
              className="p-3 bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-500 hover:text-brand-600 transition-all hover:bg-white shadow-sm flex items-center gap-2"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAddUser}
              className="px-6 py-3 bg-brand-500 text-white rounded-2xl text-sm font-black hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
            >
              <UserPlus className="w-5 h-5" />
              Nuevo Usuario
            </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100/50 dark:border-gray-800/50 shadow-inner bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md">
              <th className="p-5 font-semibold tracking-wide">Empleado</th>
              <th className="p-5 font-semibold tracking-wide">Contacto / Horario</th>
              <th className="p-5 font-semibold tracking-wide text-center">Rol / Turno</th>
              <th className="p-5 font-semibold tracking-wide text-right">Ingreso / Sueldo</th>
              {isAdmin && <th className="p-5 font-semibold tracking-wide text-center">Acciones</th>}
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{u.full_name || 'Sin Nombre'}</span>
                        <span className="text-xs text-gray-500">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        {u.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {u.schedule || 'Sin horario'}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' 
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : u.role || 'Empleado'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">{u.shift || 'Mañana'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                        <Calendar className="w-3 h-3" />
                        {u.entry_date ? new Date(u.entry_date).toLocaleDateString('es-PE') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        {u.salary ? u.salary.toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        userToEdit={selectedUser}
      />
    </div>
  );
}
