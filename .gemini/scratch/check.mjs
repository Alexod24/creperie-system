import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axdelqqaydopyxysecmf.supabase.co',
  'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG'
);

async function run() {
  const p = await supabase.from('products').select('*').ilike('name', '%huevo%');
  const i = await supabase.from('ingredients').select('*').ilike('name', '%huevo%');
  const r = await supabase.from('recipes').select('*');
  const m = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(5);

  console.log('Products:', JSON.stringify(p.data, null, 2));
  console.log('Ingredients:', JSON.stringify(i.data, null, 2));
  console.log('Recipes:', JSON.stringify(r.data, null, 2));
  console.log('Movements:', JSON.stringify(m.data, null, 2));
}
run();
