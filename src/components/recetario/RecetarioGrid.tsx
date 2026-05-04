"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, ChevronRight, Search } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
};
export default function RecetarioGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabaseQuery<any>(
        () => supabase
          .from("products")
          .select("*")
          .eq('is_active', true)
          .order("name"),
        2,
        "fetch-recetario-products"
      );

      
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Exception fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Cargando catálogo de recetas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recetario</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona los ingredientes y proporciones de tus productos.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron productos.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/recetario/${product.id}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-brand-500 transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <BookOpen className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                  Configurado
                </div>
              </div>

              {/* Info Container */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Precio sugerido: S/ {product.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-lg">
                    Ver Receta
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
