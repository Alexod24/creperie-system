"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/button/Button";

type Product = {
  id: number;
  name: string;
  image_url: string | null;
  stock: number;
  is_active: boolean;
};

type PrepItem = Product & {
  quantityToPrep: number;
};

export default function PreparacionModule() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [prepList, setPrepList] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const addToPrep = (product: Product) => {
    setPrepList((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantityToPrep: item.quantityToPrep + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantityToPrep: 1 }];
    });
  };

  const removeFromPrep = (id: number) => {
    setPrepList((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQuantity = (id: number, delta: number) => {
    setPrepList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantityToPrep + delta);
          return { ...item, quantityToPrep: newQty };
        }
        return item;
      })
    );
  };

  const processPreparation = async () => {
    if (prepList.length === 0 || !user) return;
    setIsProcessing(true);

    try {
      // Por cada producto en la lista, llamamos a la función RPC de Supabase
      for (const item of prepList) {
        const { error } = await supabase.rpc('process_preparation', {
          p_product_id: item.id,
          p_quantity: item.quantityToPrep,
          p_user_id: user.id
        });

        if (error) {
          console.error("Error RPC:", error);
          throw new Error(`Error al preparar ${item.name}: ${error.message || 'Verifica que haya suficiente stock de insumos.'}`);
        }
      }

      alert("Preparación registrada exitosamente. Se ha sumado el stock y descontado insumos.");
      setPrepList([]); // Limpiar lista
      fetchProducts(); // Refrescar stock visual de productos
    } catch (error: any) {
      console.error("Error general:", error);
      alert(error.message || "Hubo un error al procesar la preparación.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Grid */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Postres a Preparar</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-gray-500 py-10">Cargando catálogo...</p>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10">No hay productos activos.</p>
          ) : (
            products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToPrep(prod)}
                className="group cursor-pointer flex flex-col rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-brand-500 transition-colors overflow-hidden h-40 relative"
              >
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                  Stock: {prod.stock ?? 0}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-800 flex items-center justify-center relative">
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  )}
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{prod.name}</h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prep List Panel */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Lista de Preparación</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/20">
          {prepList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Selecciona qué vas a preparar hoy.
            </div>
          ) : (
            prepList.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{item.name}</h4>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button onClick={() => changeQuantity(item.id, -1)} className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">-</button>
                  <span className="text-base font-semibold w-6 text-center">{item.quantityToPrep}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
                </div>
                
                <button 
                  onClick={() => removeFromPrep(item.id)}
                  className="ml-4 text-red-400 hover:text-red-500 flex-shrink-0"
                  title="Eliminar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button 
            className="w-full h-12 text-lg font-semibold"
            disabled={prepList.length === 0 || isProcessing}
            onClick={processPreparation}
          >
            {isProcessing ? "Procesando..." : "Confirmar Preparación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
