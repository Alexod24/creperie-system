
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Probando login con admin@admin.com...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'admin123'
  });

  if (error) {
    console.error('Error de login:', error.message);
  } else {
    console.log('Login exitoso!', data.user.email);
  }
}

testLogin();
