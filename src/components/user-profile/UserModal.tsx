"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseUrl, supabaseKey } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { X, UserPlus, Save, Mail, Shield, Clock, Phone, Calendar, DollarSign, User as UserIcon, Loader2, ArrowRight } from "lucide-react";

interface User {
  id?: string;
  email: string;
  full_name: string;
  role: string;
  shift?: string;
  schedule?: string;
  phone?: string;
  entry_date?: string;
  salary?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    email: "",
    full_name: "",
    role: "empleado",
    shift: "mañana",
    schedule: "",
    phone: "",
    entry_date: new Date().toISOString().split("T")[0],
    salary: 0,
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        entry_date: userToEdit.entry_date ? new Date(userToEdit.entry_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        email: "",
        full_name: "",
        role: "empleado",
        shift: "mañana",
        schedule: "",
        phone: "",
        entry_date: new Date().toISOString().split("T")[0],
        salary: 0,
      });
      setPassword("");
    }
  }, [userToEdit, isOpen]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit?.id) {
        const { error } = await supabase
          .from("users")
          .update({
            full_name: formData.full_name,
            role: formData.role,
            shift: formData.shift,
            schedule: formData.schedule,
            phone: formData.phone,
            entry_date: formData.entry_date,
            salary: formData.salary,
          })
          .eq("id", userToEdit.id);

        if (error) throw error;
        showToast("Éxito", "Empleado actualizado correctamente", "success");
      } else {
        // Create a strictly transient client that doesn't use any storage
        // This is the most robust way to prevent the admin session from being replaced
        const transientClient = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
          }
        });

        const { data: authData, error: authError } = await transientClient.auth.signUp({
          email: formData.email!,
          password: password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role,
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: dbError } = await supabase
            .from("users")
            .upsert({
              id: authData.user.id,
              email: formData.email,
              full_name: formData.full_name,
              role: formData.role,
              shift: formData.shift,
              schedule: formData.schedule,
              phone: formData.phone,
              entry_date: formData.entry_date,
              salary: formData.salary,
            });
          
          if (dbError) throw dbError;
        }

        showToast("Éxito", "Empleado creado exitosamente", "success");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast("Error", error.message || "Error al guardar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
        
        {/* Close button inside header */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header - Matching Apertura de Caja */}
        <div className="p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
              {userToEdit ? <Save className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-2xl font-black tracking-tight">
              {userToEdit ? "Editar Empleado" : "Nuevo Empleado"}
            </h3>
            <p className="text-brand-100 text-sm mt-2 max-w-md">
              {userToEdit ? "Modifica los datos laborales del miembro de tu equipo." : "Registra un nuevo miembro del equipo y configura sus permisos y horarios."}
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserIcon className="w-24 h-24" />
          </div>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-gray-800">
          
          <div className="space-y-8">
            
            {/* Section 1: Access */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Acceso y Perfil</h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="text"
                      name="full_name"
                      value={formData.full_name || ""}
                      onChange={handleChange}
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm"
                      placeholder="Ej. Alexander Levy"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      disabled={!!userToEdit}
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm disabled:opacity-50"
                      placeholder="empleado@creperia.com"
                    />
                  </div>
                </div>

                {!userToEdit && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Contraseña Temporal</label>
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Rol Operativo</label>
                  <div className="relative">
                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role || "empleado"}
                      onChange={handleChange}
                      className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm appearance-none cursor-pointer"
                    >
                      <option value="empleado">Empleado Estándar</option>
                      <option value="admin">Administrador Total</option>
                      <option value="cajero">Cajero Principal</option>
                      <option value="cocina">Cocinero / Preparación</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Job Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2">Detalles Laborales</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Turno</label>
                    <select
                      name="shift"
                      value={formData.shift || ""}
                      onChange={handleChange}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm appearance-none cursor-pointer text-center"
                    >
                      <option value="mañana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="noche">Noche</option>
                      <option value="completo">Completo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm"
                        placeholder="987..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Horario Específico</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="schedule"
                      value={formData.schedule || ""}
                      onChange={handleChange}
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm"
                      placeholder="Ej. 8:00 AM - 4:00 PM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Fecha Ingreso</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="entry_date"
                        value={formData.entry_date || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Sueldo (S/.)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="salary"
                        value={formData.salary ?? 0}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-brand-600 dark:text-brand-400 text-lg"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Matching Modal Footer Style */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {userToEdit ? "Guardar Cambios" : "Confirmar Registro"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
