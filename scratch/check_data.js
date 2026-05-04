
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: ingredients } = await supabase.from('ingredients').select('name, unit');
  console.log('--- INGREDIENTS ---');
  console.log(JSON.stringify(ingredients, null, 2));

  const { data: products } = await supabase.from('products').select('id, name').ilike('name', '%Crepa%');
  console.log('--- PRODUCTS (Crepas) ---');
  console.log(JSON.stringify(products, null, 2));
}

check();
