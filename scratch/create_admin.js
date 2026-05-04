
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('Intentando crear cuenta de administrador...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@creperia.com',
    password: 'adminpassword123',
    options: {
      data: {
        full_name: 'Administrador del Sistema',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error al crear el usuario:', error.message);
  } else {
    console.log('Usuario creado exitosamente:', data.user.email);
    console.log('ID del usuario:', data.user.id);
    console.log('Nota: Es posible que debas confirmar el correo electrónico si la confirmación está activada en Supabase.');
  }
}

createAdmin();
