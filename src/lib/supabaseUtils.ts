import { supabase } from "./supabaseClient";

/**
 * Realiza una consulta a Supabase con un tiempo límite (timeout) para evitar bloqueos infinitos de la UI.
 * @param query La promesa o query de Supabase
 * @param timeoutMs Tiempo máximo de espera en milisegundos (default 30000)
 * @param label Etiqueta para identificar la consulta en logs (opcional)
 */
export async function supabaseQuery<T>(
  query: any, 
  timeoutMs: number = 45000,
  label: string = "unnamed-query",
  retries: number = 2
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let timeoutId: any;
    
    try {
      if (attempt > 0) {
        console.log(`Retrying query [${label}] - Attempt ${attempt}/${retries}`);
        // Pequeña espera antes de reintentar (exponential backoff simple)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error(`Timeout de conexión con Supabase [${label}] tras ${timeoutMs / 1000}s`);
          reject(error);
        }, timeoutMs);
      });

      // Ejecutamos la consulta. Usamos Promise.race para el timeout.
      const result = await Promise.race([
        Promise.resolve(query), 
        timeoutPromise
      ]) as any;
      
      if (timeoutId) clearTimeout(timeoutId);

      // Si Supabase devuelve un error en el objeto de respuesta, lo lanzamos para que el catch lo maneje
      if (result && result.error) {
        throw result.error;
      }

      return result as T;

    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = error;

      const isTimeout = error.message?.includes("Timeout");
      const isNetworkError = error.message?.includes("fetch") || error.message?.includes("Network");

      if (attempt < retries && (isTimeout || isNetworkError)) {
        console.warn(`Supabase Query failed [${label}], retrying...`, error.message);
        continue;
      }
      
      console.error(`Supabase Query Error final [${label}]:`, error);
      throw error;
    }
  }
  
  throw lastError;
}
