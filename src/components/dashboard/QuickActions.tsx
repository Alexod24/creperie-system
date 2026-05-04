import React from "react";
import { ShoppingCart, Package, MoreVertical } from "lucide-react";
import Link from "next/link";

const QuickActions: React.FC = () => {
  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones rápidas</h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/pos"
          className="flex items-start p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mr-4 border border-gray-100 dark:border-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Registrar Venta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ir al Punto de Venta (POS) para cobrar una orden</p>
          </div>
        </Link>

        <Link 
          href="/inventario"
          className="flex items-start p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mr-4 border border-gray-100 dark:border-gray-700 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
            <Package className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Gestionar Inventario</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revisar stock de insumos y niveles críticos</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
