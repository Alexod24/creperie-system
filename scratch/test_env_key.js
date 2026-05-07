
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    console.log('Testing with key from .env.local...');
    const { data: products, error } = await supabase.from('products').select('id, name').limit(5);
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Products:', products.length);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
