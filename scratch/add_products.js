
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addProducts() {
  const products = [
    { name: 'INFUSIÓN MANZANILLA', price: 3.00, is_active: true },
    { name: 'INFUSIÓN ANÍS', price: 3.00, is_active: true },
    { name: 'INFUSIÓN TÉ', price: 3.00, is_active: true },
    { name: 'INFUSIÓN TÉ CON CANELA', price: 3.00, is_active: true },
    { name: 'CAFÉ PASADO', price: 4.00, is_active: true }
  ];

  for (const product of products) {
    console.log(`Adding ${product.name}...`);
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select();
    
    if (error) {
      console.error(`Error adding ${product.name}:`, error.message);
    } else {
      console.log(`Successfully added ${product.name}`);
    }
  }
}

addProducts();
