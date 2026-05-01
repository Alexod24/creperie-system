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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 pt-4">
          <button
            className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all ${
              activeTab === "insumos"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("insumos")}
          >
            Salidas de Insumos
          </button>
          <button
            className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all ${
              activeTab === "productos"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("productos")}
          >
            Entradas de Productos
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-10 text-center text-gray-500">Cargando movimientos...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No hay movimientos registrados en la pestaña de{" "}
            {activeTab === "insumos" ? "insumos" : "productos"}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Fecha y Hora</TableCell>
                  <TableCell isHeader>Tipo</TableCell>
                  <TableCell isHeader>{activeTab === "insumos" ? "Insumo" : "Producto Final"}</TableCell>
                  <TableCell isHeader>Cantidad</TableCell>
                  <TableCell isHeader>Usuario</TableCell>
                  <TableCell isHeader>Notas</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(mov.created_at).toLocaleString("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>{getMovementBadge(mov.movement_type)}</TableCell>
                    <TableCell className="font-medium text-gray-800 dark:text-white/90">
                      {activeTab === "insumos"
                        ? mov.ingredients?.name || "Desconocido"
                        : mov.products?.name || "Desconocido"}
                    </TableCell>
                    <TableCell>{getQuantityDisplay(mov)}</TableCell>
                    <TableCell>
                      {mov.users?.full_name || mov.users?.email || "Sistema"}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm truncate max-w-[200px]" title={mov.notes}>
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
