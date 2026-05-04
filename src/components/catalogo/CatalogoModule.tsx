"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import CreateProductModal from "./CreateProductModal";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
};

export default function CatalogoModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { role, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, user]);
 
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseQuery<any>(
        () => supabase
          .from("products")
          .select("*")
          .order("name"),
        2,
        "fetch-products-catalogo"
      );
      
      if (error) {
        console.error("Error fetching products:", error);
      }

      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Exception fetching products:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-4">
      {role === "admin" && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Postre
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Precio (S/)
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Stock Disp.
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Estado
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center text-gray-500" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span>Cargando catálogo...</span>
                      <button 
                        onClick={fetchProducts}
                        className="text-xs text-brand-600 hover:text-brand-700 underline font-medium mt-1"
                      >
                        ¿Tarda demasiado? Reintentar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={5}>
                    No hay postres registrados en el catálogo.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.stock ?? 0}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <Badge
                        size="sm"
                        color={
                          item.is_active ? "success" : "error"
                        }
                      >
                        {item.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
