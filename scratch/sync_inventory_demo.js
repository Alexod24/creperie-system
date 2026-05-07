
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncInventory() {
  console.log('--- Sincronizando Inventario de Insumos ---');
  const { data: ingredients } = await supabase.from('ingredients').select('id, name, unit');
  
  for (const ing of ingredients) {
    let newStock = 0;
    const unit = ing.unit.toLowerCase();
    
    if (unit.includes('unid') || unit.includes('paq') || unit.includes('u')) {
      newStock = Math.floor(Math.random() * (200 - 50 + 1)) + 50; // 50-200
    } else if (unit === 'kg' || unit === 'litros' || unit === 'l') {
      newStock = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5-15
    } else if (unit === 'g' || unit === 'ml') {
      newStock = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000; // 3000-10000
    } else {
      newStock = 100;
    }
    
    console.log(`Actualizando ${ing.name}: ${newStock} ${ing.unit}`);
    await supabase.from('ingredients').update({ current_stock: newStock }).eq('id', ing.id);
  }

  console.log('\n--- Sincronizando Stock de Productos ---');
  const { data: products } = await supabase.from('products').select('id, name');
  
  for (const prod of products) {
    const newStock = Math.floor(Math.random() * (50 - 15 + 1)) + 15; // 15-50
    console.log(`Actualizando ${prod.name}: ${newStock} unidades`);
    await supabase.from('products').update({ stock: newStock }).eq('id', prod.id);
  }

  console.log('\n¡Listo! Inventario regulado para demostración.');
}

syncInventory();
