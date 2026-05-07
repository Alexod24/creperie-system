
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data: sales, error } = await supabase.from('sales').select('*, users(full_name)').limit(5);
    console.log('--- SALES WITH USERS ---');
    if (error) {
      console.error('Error:', error);
    } else {
      console.log(JSON.stringify(sales, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
