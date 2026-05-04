
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: recipes } = await supabase
    .from('recipes')
    .select('*, products(name), ingredients(name, unit)')
    .ilike('products.name', 'CREPA MÉDIUM%');
  
  console.log('--- RECIPES (Crepa Medium) ---');
  console.log(JSON.stringify(recipes, null, 2));
}

check();
