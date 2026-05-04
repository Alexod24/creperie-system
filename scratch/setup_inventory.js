
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupInventory() {
  // 1. Agregar Insumos Nuevos
  const newIngredients = [
    { name: 'Cono de Galleta', unit: 'u', min_stock: 50, current_stock: 0 },
    { name: 'Helado (Masa)', unit: 'g', min_stock: 1000, current_stock: 0 },
    { name: 'Bolsita de Manzanilla', unit: 'u', min_stock: 20, current_stock: 0 },
    { name: 'Bolsita de Anís', unit: 'u', min_stock: 20, current_stock: 0 },
    { name: 'Bolsita de Té', unit: 'u', min_stock: 20, current_stock: 0 },
    { name: 'Bolsita de Té con Canela', unit: 'u', min_stock: 20, current_stock: 0 },
    { name: 'Café Molido', unit: 'g', min_stock: 500, current_stock: 0 }
  ];

  console.log('Adding new ingredients...');
  for (const ing of newIngredients) {
    const { error } = await supabase.from('ingredients').insert(ing);
    if (error) console.warn(`Note: Ingredient ${ing.name} might already exist or failed: ${error.message}`);
  }

  // 2. Obtener IDs de todo para las recetas
  const { data: allIngs } = await supabase.from('ingredients').select('id, name');
  const { data: allProds } = await supabase.from('products').select('id, name');

  const getIngId = (name) => allIngs.find(i => i.name === name)?.id;
  const getProdId = (name) => allProds.find(p => p.name === name)?.id;

  // 3. Definir Recetas
  const recipes = [
    // Helado
    { prod: 'CONO DE HELADO', ing: 'Cono de Galleta', qty: 1 },
    { prod: 'CONO DE HELADO', ing: 'Helado (Masa)', qty: 80 },
    
    // Infusiones
    { prod: 'INFUSIÓN MANZANILLA', ing: 'Bolsita de Manzanilla', qty: 1 },
    { prod: 'INFUSIÓN ANÍS', ing: 'Bolsita de Anís', qty: 1 },
    { prod: 'INFUSIÓN TÉ', ing: 'Bolsita de Té', qty: 1 },
    { prod: 'INFUSIÓN TÉ CON CANELA', ing: 'Bolsita de Té con Canela', qty: 1 },
    { prod: 'CAFÉ PASADO', ing: 'Café Molido', qty: 15 },

    // Crepas Saladas
    { prod: 'CREPA MEDIUM SALADO', ing: 'Masa de Crepa (Porción)', qty: 1 },
    { prod: 'CREPA MEDIUM SALADO', ing: 'Jamón', qty: 30 },
    { prod: 'CREPA MEDIUM SALADO', ing: 'Queso Edam/Mozzarella', qty: 30 },

    { prod: 'CREPA PREMIUM SALADO', ing: 'Masa de Crepa (Porción)', qty: 1 },
    { prod: 'CREPA PREMIUM SALADO', ing: 'Pollo Deshilachado (Cocido)', qty: 40 },
    { prod: 'CREPA PREMIUM SALADO', ing: 'Queso Edam/Mozzarella', qty: 30 },
    { prod: 'CREPA PREMIUM SALADO', ing: 'Papas al Hilo', qty: 20 }
  ];

  console.log('Linking recipes...');
  for (const r of recipes) {
    const productId = getProdId(r.prod);
    const ingredientId = getIngId(r.ing);

    if (productId && ingredientId) {
      const { error } = await supabase.from('recipes').insert({
        product_id: productId,
        ingredient_id: ingredientId,
        quantity_required: r.qty
      });
      if (error) console.error(`Error linking ${r.prod} with ${r.ing}:`, error.message);
      else console.log(`Linked ${r.prod} -> ${r.ing} (${r.qty})`);
    } else {
      console.warn(`Missing ID for ${r.prod} (${productId}) or ${r.ing} (${ingredientId})`);
    }
  }

  console.log('Done!');
}

setupInventory();
