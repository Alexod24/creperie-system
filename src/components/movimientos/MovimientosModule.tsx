"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Inicializa Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Movement {
  id: number;
  movement_type: string;
  quantity: number;
  notes: string;
  created_at: string;
  ingredients: { name: string; unit: string } | null;
  products: { name: string; price: number } | null;
  users: { full_name: string; email: string } | null;
}

export default function MovimientosModule() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"insumos" | "productos">("insumos");

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_movements")
        .select(`
          id,
          movement_type,
          quantity,
          notes,
          created_at,
          ingredients ( name, unit ),
          products ( name, price ),
          users ( full_name, email )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching movements:", error);
      } else {
        // Parse the joined data according to Supabase response format
        const formattedData = (data || []).map((m: { ingredients: Record<string, unknown>, products: Record<string, unknown>, users: Record<string, unknown>, [key: string]: unknown }) => ({
          ...m,
          ingredients: Array.isArray(m.ingredients) ? m.ingredients[0] : m.ingredients,
          products: Array.isArray(m.products) ? m.products[0] : m.products,
          users: Array.isArray(m.users) ? m.users[0] : m.users,
        }));
        setMovements(formattedData);
      }
    } catch (err) {
      console.error("Unexpected error fetching movements:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "entrada":
        return <Badge color="success">Entrada</Badge>;
      case "salida":
        return <Badge color="error">Salida</Badge>;
      case "preparacion":
        return <Badge color="warning">Preparación</Badge>;
      case "venta":
        return <Badge color="info">Venta</Badge>;
      default:
        return <Badge color="light">{type}</Badge>;
    }
  };

  const getQuantityDisplay = (mov: Movement) => {
    let prefix = "";
    let colorClass = "text-gray-600";
    let unit = "";

    if (activeTab === "insumos") {
      // Insumos logic: preparacion and salida are deductions, entrada is addition
      prefix = mov.movement_type === "entrada" ? "+" : "-";
      colorClass = mov.movement_type === "entrada" ? "text-success-600" : "text-error-600";
      unit = mov.ingredients?.unit || "";
    } else {
      // Productos logic: entrada (preparacion) is addition, venta is deduction
      prefix = mov.movement_type === "entrada" ? "+" : "-";
      colorClass = mov.movement_type === "entrada" ? "text-success-600" : "text-error-600";
      unit = "unidades";
    }

    return (
      <span className={`font-semibold ${colorClass}`}>
        {prefix}{mov.quantity} {unit}
      </span>
    );
  };

  const filteredMovements = movements.filter((mov) => {
    if (activeTab === "insumos") return !!mov.ingredients;
    if (activeTab === "productos") return !!mov.products;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Historial de Movimientos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Auditoría de almacén: entradas, salidas y consumo de ingredientes.
          </p>
        </div>
        <button
          onClick={fetchMovements}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 px-6 pt-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm gap-2">
          <button
            className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition-all duration-300 ${
              activeTab === "insumos"
                ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("insumos")}
          >
            Salidas de Insumos
          </button>
          <button
            className={`py-3 px-6 font-semibold text-sm rounded-t-xl transition-all duration-300 ${
              activeTab === "productos"
                ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("productos")}
          >
            Entradas de Productos
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-500 space-y-3">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No hay movimientos registrados en {activeTab === "insumos" ? "insumos" : "productos"}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-md">
                <TableRow className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">Fecha y Hora</TableCell>
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">Tipo</TableCell>
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">{activeTab === "insumos" ? "Insumo" : "Producto Final"}</TableCell>
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">Cantidad</TableCell>
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">Usuario</TableCell>
                  <TableCell isHeader className="p-5 text-gray-600 dark:text-gray-300 font-semibold tracking-wide">Notas</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
                {filteredMovements.map((mov) => (
                  <TableRow 
                    key={mov.id} 
                    className="hover:bg-brand-50/40 dark:hover:bg-gray-800/60 transition-colors duration-200 group border-b border-gray-50 dark:border-gray-800/50"
                  >
                    <TableCell className="p-5 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                      {new Date(mov.created_at).toLocaleString("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="p-5">
                      <div className="transform group-hover:scale-105 transition-transform duration-300 inline-block">
                        {getMovementBadge(mov.movement_type)}
                      </div>
                    </TableCell>
                    <TableCell className="p-5 font-bold text-gray-800 dark:text-gray-100">
                      {activeTab === "insumos"
                        ? mov.ingredients?.name || "Desconocido"
                        : mov.products?.name || "Desconocido"}
                    </TableCell>
                    <TableCell className="p-5 text-lg">{getQuantityDisplay(mov)}</TableCell>
                    <TableCell className="p-5 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                          {(mov.users?.full_name || mov.users?.email || "S")[0].toUpperCase()}
                        </div>
                        {mov.users?.full_name || mov.users?.email || "Sistema"}
                      </div>
                    </TableCell>
                    <TableCell className="p-5 text-gray-500 text-sm truncate max-w-[200px]" title={mov.notes}>
                      {mov.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
