import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton persistente que sobrevive a los refrescos de Next.js (Fast Refresh)
const getSupabaseInstance = () => {
  if (typeof window !== 'undefined' && (window as any)._supabaseInstance) {
    return (window as any)._supabaseInstance;
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'creperie-auth-token',
    }
  });

  if (typeof window !== 'undefined') {
    (window as any)._supabaseInstance = client;
  }

  return client;
};

export const supabase = getSupabaseInstance();
