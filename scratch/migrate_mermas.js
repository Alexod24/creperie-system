
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const sql = `
    ALTER TABLE public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_movement_type_check;
    ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_movement_type_check 
      CHECK (movement_type IN ('entrada', 'salida', 'preparacion', 'venta', 'merma'));

    CREATE TABLE IF NOT EXISTS public.mermas (
      id SERIAL PRIMARY KEY,
      ingredient_id INTEGER REFERENCES public.ingredients(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.users(id),
      quantity NUMERIC(10, 2) NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.mermas ENABLE ROW LEVEL SECURITY;
  `;
  
  // Note: Supabase JS client doesn't support raw SQL easily unless we use RPC or a service role.
  // I will use RPC if available or just assume I can create the table via a script that uses the API.
  // Actually, I'll use the 'supabase' CLI if available or just create it via the API for testing.
  
  console.log("Migration should be run in Supabase Dashboard SQL Editor.");
}

migrate();
