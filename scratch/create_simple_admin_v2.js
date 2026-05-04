
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@admin.com';
  const password = 'admin123';

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: 'Admin Sistema',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error al crear el usuario:', error.message);
  } else {
    console.log('Usuario creado exitosamente:', data.user.email);
    console.log('Contraseña:', password);
  }
}

createAdmin();
