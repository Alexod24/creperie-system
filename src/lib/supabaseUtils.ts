import { supabase } from "./supabaseClient";

/**
 * Realiza una consulta a Supabase con un tiempo límite (timeout) para evitar bloqueos infinitos de la UI.
 * @param query La promesa o query de Supabase
 * @param timeoutMs Tiempo máximo de espera en milisegundos (default 120000)
 * @param label Etiqueta para identificar la consulta en logs (opcional)
 */
export async function supabaseQuery<T>(
  queryOrFactory: any, 
  retries: number = 2, 
  label: string = "unnamed-query",
  timeoutMs: number = 120000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let timeoutId: any;
    
    try {
      if (attempt > 0) {
        // Cálculo de espera con backoff exponencial y jitter (aleatoriedad)
        // Intento 1: ~1-2s, Intento 2: ~4-5s
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
        console.warn(`Reintento ${attempt}/${retries} para [${label}] en ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error(`Timeout de conexión con Supabase [${label}] tras ${timeoutMs / 1000}s`);
          reject(error);
        }, timeoutMs);
      });

      // Si es una función (factory), obtenemos una instancia nueva para cada reintento.
      // Esto es CRUCIAL porque una promesa fallida de Supabase no se puede "reiniciar".
      const queryToExec = typeof queryOrFactory === 'function' ? queryOrFactory() : queryOrFactory;
      
      const result = await Promise.race([
        Promise.resolve(queryToExec), 
        timeoutPromise
      ]) as any;
      
      if (timeoutId) clearTimeout(timeoutId);

      // Si Supabase devuelve un error en el objeto de respuesta, lo lanzamos para reintentar
      if (result && result.error) {
        throw result.error;
      }

      return result as T;

    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = error;

      // Solo reintentamos si no es el último intento
      if (attempt < retries) {
        // Log detallado para diagnóstico
        console.warn(`Fallo en [${label}] (Intento ${attempt + 1}):`, error.message || error);
        continue;
      }
      
      console.error(`Error definitivo en [${label}] tras ${retries + 1} intentos:`, error);
      throw error;
    }
  }
  
  throw lastError;
}
