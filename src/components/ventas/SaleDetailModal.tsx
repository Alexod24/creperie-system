"use client";

import React from "react";
import { X, Calendar, User, CreditCard, Hash, Package } from "lucide-react";
import Button from "@/components/ui/button/Button";

type Sale = {
  id: number;
  total: number;
  payment_method: string;
  payment_reference: string | null;
  created_at: string;
  users: {
    full_name: string;
  };
};

type SaleItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: {
    name: string;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  items: SaleItem[];
  loading: boolean;
};

export default function SaleDetailModal({ isOpen, onClose, sale, items, loading }: Props) {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Hash className="w-6 h-6 text-brand-500" />
              Venta #{sale.id}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Detalle completo de la transacción</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Fecha
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Date(sale.created_at).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Cajero
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{sale.users?.full_name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Pago
              </span>
              <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{sale.payment_method}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Cant.</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse h-12 bg-gray-50/50 dark:bg-gray-800/50">
                      <td colSpan={4}></td>
                    </tr>
                  ))
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="text-gray-700 dark:text-gray-300 font-medium">
                      <td className="px-6 py-4 flex items-center gap-3 font-bold">
                        <Package className="w-4 h-4 text-gray-300" />
                        {item.products?.name}
                      </td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">S/ {item.unit_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">S/ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Footer */}
          <div className="flex justify-end pt-4">
            <div className="bg-brand-500 text-white px-8 py-4 rounded-3xl flex items-center gap-6 shadow-xl shadow-brand-500/20">
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Total de Venta</span>
              <span className="text-3xl font-black">S/ {sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
          <Button variant="outline" onClick={onClose} className="rounded-2xl px-12">
            Cerrar Detalle
          </Button>
        </div>
      </div>
    </div>
  );
}
