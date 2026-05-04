"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/button/Button";
import { Trash2, AlertTriangle } from "lucide-react";

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
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [prepList, setPrepList] = useState<PrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [insufficientItems, setInsufficientItems] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseQuery(
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("name"),
        undefined,
        "fetch-products"
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

  const updateQuantity = (id: number, value: number) => {
    setPrepList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, value);
          return { ...item, quantityToPrep: newQty };
        }
        return item;
      })
    );
  };

  const [totalBom, setTotalBom] = useState<any[]>([]);

  useEffect(() => {
    calculateTotalBom();
  }, [prepList]);

  const calculateTotalBom = async () => {
    if (prepList.length === 0) {
      setTotalBom([]);
      return;
    }

    try {
      // Obtener todas las recetas de los productos en la lista
      const productIds = prepList.map(p => p.id);
      const bomMap = new Map();
      
      // REFACTORED FETCH WITH TIMEOUT PROTECTION:
      const { data: recipesWithPid } = await supabaseQuery(
        supabase
          .from("recipes")
          .select(`
            product_id,
            quantity_required,
            ingredients ( id, name, unit, current_stock )
          `)
          .in("product_id", productIds),
        undefined,
        "calculate-bom"
      );

      if (recipesWithPid) {
        recipesWithPid.forEach((r: any) => {
          const product = prepList.find(p => p.id === r.product_id);
          if (product) {
            const totalNeeded = r.quantity_required * product.quantityToPrep;
            const existing = bomMap.get(r.ingredients.id) || { 
              id: r.ingredients.id,
              name: r.ingredients.name, 
              unit: r.ingredients.unit, 
              current_stock: r.ingredients.current_stock,
              totalNeeded: 0 
            };
            bomMap.set(r.ingredients.id, { 
              ...existing, 
              totalNeeded: existing.totalNeeded + totalNeeded 
            });
          }
        });
        setTotalBom(Array.from(bomMap.values()));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const validateStockAndProcess = async () => {
    if (prepList.length === 0 || !user) return;
    
    // Verificar si hay algún insumo insuficiente
    const issues = totalBom.filter(ing => ing.current_stock < ing.totalNeeded);
    
    if (issues.length > 0) {
      setInsufficientItems(issues);
      setShowConfirmModal(true);
    } else {
      processPreparation(false);
    }
  };

  const processPreparation = async (ignoreStock: boolean = false) => {
    setIsProcessing(true);
    setShowConfirmModal(false);

    try {
      console.log(`Iniciando preparación (ignoreStock: ${ignoreStock})...`);
      
      for (const item of prepList) {
        const { error } = await supabaseQuery(
          supabase.rpc('process_preparation', {
            p_product_id: item.id,
            p_quantity: item.quantityToPrep,
            p_user_id: user.id,
            p_ignore_stock: ignoreStock
          }),
          undefined,
          "process-prep"
        );
        
        if (error) {
          console.error(`Error preparando ${item.name}:`, error);
          throw new Error(`Error al preparar ${item.name}: ${error.message}`);
        }
      }

      showToast(
        ignoreStock ? "Preparación Forzada" : "Preparación Exitosa", 
        ignoreStock ? "Se registró la preparación pese a la falta de insumos." : "Se ha sumado el stock y descontado insumos.", 
        ignoreStock ? "warning" : "success"
      );
      
      setPrepList([]); 
      fetchProducts(); 
    } catch (error: any) {
      console.error("Error general en preparación:", error);
      showToast("Error", error.message || "Hubo un error al procesar la preparación.", "error");
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
            <div className="col-span-full flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <p className="text-gray-500">Cargando catálogo...</p>
              <button 
                onClick={fetchProducts}
                className="text-xs text-brand-600 hover:text-brand-700 underline font-medium"
              >
                ¿Tarda demasiado? Reintentar
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-10">No hay productos activos.</p>
          ) : (
            products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToPrep(prod)}
                className="group cursor-pointer flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 hover:shadow-lg transition-all duration-300 overflow-hidden relative hover:-translate-y-1"
                style={{ minHeight: '230px', height: '100%' }}
              >
                <div className="absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-medium z-10 shadow-sm backdrop-blur-md bg-gray-900/60">
                  Stock: {prod.stock ?? 0}
                </div>
                
                {/* Contenedor de Imagen */}
                <div className="w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center shrink-0" style={{ height: '150px', minHeight: '150px', display: 'flex' }}>
                  {prod.image_url ? (
                    <img 
                      src={prod.image_url} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="text-xs font-medium uppercase tracking-wider">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Contenedor de Texto */}
                <div className="p-4 flex flex-col flex-1 border-t border-gray-100 dark:border-gray-700 justify-between bg-white dark:bg-gray-800">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug" style={{ minHeight: '40px' }}>
                    {prod.name}
                  </h3>
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
            <div className="space-y-4">
              <div className="space-y-3">
                {prepList.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex-1 mr-2">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{item.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantityToPrep - 1)} 
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantityToPrep}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantityToPrep + 1)} 
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeFromPrep(item.id)} className="ml-4 text-red-400 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {totalBom.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-3">Resumen de Materiales (Atómico)</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {totalBom.map((ing, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-amber-900 dark:text-amber-300/80">
                        <span>{ing.name}</span>
                        <span className="font-bold">{ing.totalNeeded.toFixed(2)} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-amber-600 dark:text-amber-500 italic">
                    * Estas cantidades se descontarán del inventario base al confirmar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button 
            className="w-full h-12 text-lg font-semibold"
            disabled={prepList.length === 0 || isProcessing}
            onClick={validateStockAndProcess}
          >
            {isProcessing ? "Procesando..." : "Confirmar Preparación"}
          </Button>
        </div>
      </div>

      {/* Modal de Confirmación de Stock Insuficiente */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-amber-500 text-white relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7" />
                  Insumos Insuficientes
                </h3>
                <p className="text-amber-50 text-sm mt-2 font-medium">
                  El sistema detectó que no hay suficiente stock registrado para completar esta preparación.
                </p>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Insumos en falta:</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                  {insufficientItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">{item.name}</span>
                      <div className="text-right">
                        <p className="text-[10px] text-amber-600 font-bold">Faltan: {(item.totalNeeded - item.current_stock).toFixed(2)} {item.unit}</p>
                        <p className="text-[9px] text-gray-400">Stock: {item.current_stock.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 italic">
                  Si eliges "Omitir y Procesar", el inventario quedará con **números negativos** para fines de auditoría.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => processPreparation(true)}
                  className="flex-1 px-6 py-4 bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-500/30 hover:bg-amber-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Omitir y Procesar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


