
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { count: totalSales } = await supabase.from('sales').select('*', { count: 'exact', head: true });
    const { data: salesWithUsers } = await supabase.from('sales').select('id, users(full_name)');
    
    console.log('Total sales:', totalSales);
    console.log('Sales with users count:', salesWithUsers.length);
    
    const orphans = salesWithUsers.filter(s => !s.users);
    console.log('Orphan sales (no user record):', orphans.length);
    if (orphans.length > 0) {
      console.log('First 5 orphans IDs:', orphans.slice(0, 5).map(o => o.id));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
