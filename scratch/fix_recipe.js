
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRecipe() {
  const { data: allIngs } = await supabase.from('ingredients').select('id, name');
  const { data: allProds } = await supabase.from('products').select('id, name');

  const getIngId = (name) => allIngs.find(i => i.name === name)?.id;
  const getProdId = (name) => allProds.find(p => p.name === name)?.id;

  const productId = getProdId('CREPA PREMIUM SALADO');
  const ingredientId = getIngId('Pollo Filete');

  if (productId && ingredientId) {
    const { error } = await supabase.from('recipes').insert({
      product_id: productId,
      ingredient_id: ingredientId,
      quantity_required: 40
    });
    if (error) console.error(`Error:`, error.message);
    else console.log(`Fixed Crepa Premium Salado with Pollo Filete`);
  } else {
    console.warn(`Still missing IDs`);
  }
}

fixRecipe();
