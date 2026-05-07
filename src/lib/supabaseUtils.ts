import { supabase } from "./supabaseClient";

/**
 * Realiza una consulta a Supabase y devuelve { data, error, count }.
 * Implementa reintentos y manejo de timeouts.
 */
export async function supabaseQuery<T>(
  queryOrFactory: any, 
  retries: number = 2, 
  label: string = "unnamed-query",
  signal?: AbortSignal
): Promise<{ data: T | null; error: any; count: number | null }> {
  const timeoutMs = 45000;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      if (attempt > 0) {
        console.log(`[supabaseQuery] REINTENTANDO (${attempt}/${retries}): ${label}`);
        // Pequeña espera antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        console.log(`[supabaseQuery] EJECUTANDO: ${label}`);
      }
      
      let queryToExec = typeof queryOrFactory === 'function' ? queryOrFactory() : queryOrFactory;
      
      if (signal) {
        if (queryToExec.abortSignal) {
          queryToExec = queryToExec.abortSignal(signal);
        }
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
      }
      
      const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timeout de seguridad (${timeoutMs/1000}s) en [${label}]`));
        }, timeoutMs);
        
        // Limpiar el timer si la señal se aborta
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          }, { once: true });
        }
      });

      const result = await Promise.race([
        Promise.resolve(queryToExec),
        timeoutPromise
      ]) as any;

      if (result && result.error) {
        throw result.error;
      }

      console.log(`[supabaseQuery] ÉXITO: ${label}`);
      
      return {
        data: (result?.data !== undefined ? result.data : result) as T,
        error: null,
        count: result?.count ?? null
      };

    } catch (error: any) {
      const isAbortError = error.name === 'AbortError' || error.message?.includes('abort') || error.code === '20';
      
      if (isAbortError) {
        console.log(`[supabaseQuery] CANCELADO: ${label}`);
        return { data: null, error: error, count: null };
      }

      console.error(`[supabaseQuery] FALLO en ${label} (Intento ${attempt}):`, error.message || error);

      if (attempt >= retries) {
        return { data: null, error: error, count: null };
      }
      
      attempt++;
    }
  }

  return { data: null, error: new Error("Unknown error in supabaseQuery"), count: null };
}
