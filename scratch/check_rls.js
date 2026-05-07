
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase.rpc('get_table_rls_status', { table_name: 'sales' });
    if (error) {
      // If RPC doesn't exist, try a direct query to pg_tables
      const { data: rls, error: rlsError } = await supabase.from('pg_tables').select('rowsecurity').eq('tablename', 'sales').single();
      console.log('RLS Status (pg_tables):', rls);
    } else {
      console.log('RLS Status:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Actually, I'll just check if a query with NO AUTH works.
// My previous scripts ALREADY proved it works with anon key.

check();
