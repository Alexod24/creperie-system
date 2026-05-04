import { supabase } from "./supabaseClient";

/**
 * Realiza una consulta a Supabase con un tiempo límite (timeout) para evitar bloqueos infinitos de la UI.
 * @param query La promesa o query de Supabase
 * @param timeoutMs Tiempo máximo de espera en milisegundos (default 30000)
 * @param label Etiqueta para identificar la consulta en logs (opcional)
 */
export async function supabaseQuery<T>(
  query: any, 
  timeoutMs: number = 60000,
  label: string = "unnamed-query"
): Promise<T> {
  let timeoutId: any;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`Timeout de conexión con Supabase [${label}] tras ${timeoutMs / 1000}s`);
      console.warn("Supabase Timeout Triggered:", { label, timeoutMs });
      reject(error);
    }, timeoutMs);
  });

  try {
    // Convertimos explícitamente a Promesa por si es un thenable de Supabase
    const result = await Promise.race([
      Promise.resolve(query), 
      timeoutPromise
    ]) as T;
    
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(`Supabase Query Error [${label}]:`, error);
    throw error;
  }
}

