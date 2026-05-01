import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axdelqqaydopyxysecmf.supabase.co',
  'sb_publishable_DtspX4khP2nKt7LsD6gMtA_-t86DlkG'
);

async function run() {
  const insert = await supabase.from('recipes').insert({
    product_id: 30, // ADICIONAL HUEVO
    ingredient_id: 3, // Huevos
    quantity_required: 1
  });
  console.log('Insert result:', insert);
}
run();
