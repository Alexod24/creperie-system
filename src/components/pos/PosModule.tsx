"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/button/Button";


type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
};

type CartItem = Product & {
  quantity: number;
  subtotal: number;
};

export default function PosModule() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("POS: Fetching products...");
      
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
        console.log("POS: Products loaded successfully");
        setProducts(data);
      }
    } catch (err) {
      console.error("Exception in POS fetch:", err);
    } finally {
      setLoading(false);
    }
  };




  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        );
      }
      return [
        ...prevCart,
        { ...product, quantity: 1, subtotal: product.price },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const processSale = async () => {
    if (cart.length === 0 || !user) return;
    setIsProcessing(true);

    try {
      // 1. Crear Venta
      const { data: saleData, error: saleError } = await supabaseQuery(
        supabase
          .from("sales")
          .insert({
            user_id: user.id,
            total: total,
          })
          .select()
          .single(),
        undefined,
        "insert-sale"
      );

      if (saleError) throw saleError;

      // 2. Crear Items de Venta
      const saleItems = cart.map((item) => ({
        sale_id: saleData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabaseQuery(
        supabase
          .from("sale_items")
          .insert(saleItems),
        undefined,
        "insert-sale-items"
      );

      if (itemsError) throw itemsError;

      // 3. Descontar stock de productos
      for (const item of cart) {
        await supabaseQuery(
          supabase.rpc('decrement_product_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity
          }),
          undefined,
          "decrement-stock"
        );
      }

      alert("Venta registrada exitosamente");
      setCart([]); // Limpiar carrito
      fetchProducts(); // Refrescar stock
    } catch (error) {
      console.error("Error al procesar la venta:", error);
      alert("Hubo un error al procesar la venta.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Grid */}
      <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Catálogo</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <p className="text-gray-500">Cargando productos...</p>
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
                onClick={() => prod.stock > 0 && addToCart(prod)}
                className={`group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 hover:shadow-lg transition-all duration-300 overflow-hidden relative ${prod.stock > 0 ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed opacity-60'}`}
                style={{ minHeight: '260px', height: '100%' }}
              >
                <div className={`absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-medium z-10 shadow-sm backdrop-blur-md ${prod.stock > 0 ? 'bg-gray-900/60' : 'bg-red-500/90'}`}>
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
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-base font-bold text-brand-600 dark:text-brand-400">
                      S/ {prod.price.toFixed(2)}
                    </p>
                    <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart / Ticket */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Orden Actual</h2>
          {user && <p className="text-xs text-gray-500 mt-1">Cajero: {user.email}</p>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/20">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              No hay productos en la orden.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex-1 mr-2">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-brand-500 font-medium mt-0.5">S/ {item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button onClick={() => changeQuantity(item.id, -1)} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">-</button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">+</button>
                </div>
                
                <div className="w-16 text-right ml-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">S/ {item.subtotal.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="ml-3 text-red-400 hover:text-red-500 flex-shrink-0"
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">S/ {total.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full h-12 text-lg font-semibold"
            disabled={cart.length === 0 || isProcessing}
            onClick={processSale}
          >
            {isProcessing ? "Registrando..." : "Registrar Venta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
