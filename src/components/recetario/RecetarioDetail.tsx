"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { supabaseQuery } from "@/lib/supabaseUtils";
import { useParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Save, 
  Info,
  Scale,
  Clock,
  ChevronRight,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
};

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
};

type RecipeItem = {
  id: number;
  ingredient_id: number;
  quantity_required: number;
  ingredients: Ingredient;
};

export default function RecetarioDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  
  // States for adding new ingredient
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredientId, setNewIngredientId] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<string>("");

  // States for editing existing ingredient
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RecipeItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");

  // States for product price editing
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
    }
  }, [id]);

  useEffect(() => {
    // Calcular costo total cada vez que la receta cambia
    const cost = recipe.reduce((acc, item) => {
      const ingredientCost = item.ingredients?.cost_per_unit || 0;
      return acc + (ingredientCost * item.quantity_required);
    }, 0);
    setTotalCost(cost);
  }, [recipe]);

  const fetchData = async (productId: number) => {
    setLoading(true);
    try {
      // 1. Fetch Product
      const { data: prodData } = await supabaseQuery(
        supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single(),
        undefined,
        "fetch-product-detail"
      );
      
      if (prodData) setProduct(prodData);

      // 2. Fetch Recipe
      const { data: recipeData } = await supabaseQuery(
        supabase
          .from("recipes")
          .select(`
            id,
            ingredient_id,
            quantity_required,
            ingredients ( id, name, unit, cost_per_unit )
          `)
          .eq("product_id", productId),
        undefined,
        "fetch-recipe-detail"
      );
      
      if (recipeData) {
        setRecipe(recipeData as unknown as RecipeItem[]);
      }

      // 3. Fetch all ingredients (for dropdown)
      const { data: ingData } = await supabaseQuery(
        supabase
          .from("ingredients")
          .select("*")
          .order("name"),
        undefined,
        "fetch-all-ingredients"
      );
      
      if (ingData) setAllIngredients(ingData);

    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };


  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredientId || !newQuantity || !product) return;

    try {
      const { error } = await supabase
        .from("recipes")
        .insert({
          product_id: product.id,
          ingredient_id: Number(newIngredientId),
          quantity_required: Number(newQuantity)
        });

      if (error) throw error;
      
      showToast("Éxito", "Insumo añadido correctamente", "success");
      // Refresh
      fetchData(product.id);
      setShowAddModal(false);
      setNewIngredientId("");
      setNewQuantity("");
    } catch (err) {
      showToast("Error", "Error al añadir ingrediente. Tal vez ya existe en la receta.", "error");
      console.error(err);
    }
  };

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editQuantity || !product) return;

    try {
      const { error } = await supabase
        .from("recipes")
        .update({
          quantity_required: Number(editQuantity)
        })
        .eq("id", editingItem.id);

      if (error) throw error;
      
      showToast("Éxito", "Cantidad actualizada correctamente", "success");
      // Refresh
      fetchData(product.id);
      setShowEditModal(false);
      setEditingItem(null);
      setEditQuantity("");
    } catch (err) {
      showToast("Error", "No se pudo actualizar la cantidad.", "error");
      console.error(err);
    }
  };

  const openEditModal = (item: RecipeItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity_required.toString());
    setShowEditModal(true);
  };

  const handleUpdateProductPrice = async () => {
    if (!product || !tempPrice) return;
    const newPrice = Number(tempPrice);
    if (isNaN(newPrice)) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ price: newPrice })
        .eq("id", product.id);

      if (error) throw error;
      
      setProduct({ ...product, price: newPrice });
      setIsEditingPrice(false);
      showToast("Éxito", "Precio de venta actualizado", "success");
    } catch (err) {
      showToast("Error", "No se pudo actualizar el precio.", "error");
      console.error(err);
    }
  };

  const startEditingPrice = () => {
    setTempPrice(product?.price.toString() || "");
    setIsEditingPrice(true);
  };

  const handleRemoveIngredient = async (recipeId: number) => {
    const isConfirmed = await confirm({
      title: "¿Quitar Insumo?",
      message: "¿Seguro que quieres quitar este insumo de la receta?",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;
      
      setRecipe(prev => prev.filter(item => item.id !== recipeId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Analizando receta...</p>
      </div>
    );
  }

  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center gap-3 mb-8">
        <Link 
          href="/recetario" 
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Recetario</span>
            <ChevronRight className="w-3 h-3" />
            <span>Detalle</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-900">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <Info className="w-16 h-16 opacity-10" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  Configurado
                </span>
                
                {isEditingPrice ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-20 px-2 py-1 text-sm font-bold border border-brand-500 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      autoFocus
                    />
                    <button 
                      onClick={handleUpdateProductPrice}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsEditingPrice(false)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      S/ {product.price.toFixed(2)}
                    </span>
                    {role === 'admin' && (
                      <button 
                        onClick={startEditingPrice}
                        className="p-1 text-gray-400 hover:text-brand-600 transition-colors"
                        title="Editar precio de venta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costo Estimado:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">S/ {totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Margen Bruto:</span>
                  <span className={`font-bold ${product.price - totalCost > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    S/ {(product.price - totalCost).toFixed(2)} ({(( (product.price - totalCost) / product.price ) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                Esta receta técnica utiliza unidades atómicas ($g, ml, u$) para garantizar la máxima precisión en el descuento de inventario.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Deducción Atómica
              </h3>
              <p className="text-white/80 text-sm">
                Cada gramo cuenta. Al preparar este producto, el sistema restará exactamente las cantidades base definidas aquí.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>

        </div>

        {/* Right Column: Ingredients Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Lista de Insumos</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cantidades por unidad de producto.</p>
              </div>
              
              {role === 'admin' && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Insumo
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Insumo</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad Base</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo Sugerido</th>
                    {role === 'admin' && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recipe.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                        Esta receta aún no tiene insumos asignados.
                      </td>
                    </tr>
                  ) : (
                    recipe.map((item) => (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Scale className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.ingredients?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          {item.quantity_required} {item.ingredients?.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          S/ {(item.ingredients?.cost_per_unit * item.quantity_required).toFixed(4)}
                        </td>
                        {role === 'admin' && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(item)}
                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all rounded-lg"
                                title="Editar cantidad"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRemoveIngredient(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-lg"
                                title="Eliminar de la receta"
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
          </div>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Añadir Insumo</h3>
              <p className="text-sm text-gray-500">Define qué insumo requiere esta receta.</p>
            </div>
            
            <form onSubmit={handleAddIngredient} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Seleccionar Insumo</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newIngredientId}
                  onChange={(e) => setNewIngredientId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un insumo...</option>
                  {allIngredients
                    .filter(ing => !recipe.some(r => r.ingredient_id === ing.id))
                    .map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cantidad Necesaria</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ej: 0.5 o 100"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-brand-600 text-white">
              <h3 className="text-xl font-bold">Editar Cantidad</h3>
              <p className="text-sm text-brand-100">Ajustando: {editingItem.ingredients.name}</p>
            </div>
            
            <form onSubmit={handleUpdateIngredient} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nueva Cantidad ({editingItem.ingredients.unit})
                </label>
                <input 
                  type="number" 
                  step="0.001"
                  placeholder="Ej: 0.5 o 100"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  autoFocus
                  required
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  El cambio afectará a todas las preparaciones futuras de este producto.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
