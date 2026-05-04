
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://axdelqqaydopyxysecmf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZGVscXFheWRvcHl4eXNlY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUzODAsImV4cCI6MjA5MzA2MTM4MH0.B71xFlF08_eTu3wt_AMjCHvyGsYh3o7VbTRp2rNSRLI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@creperia.com';
  const password = 'AdminPassword123!'; // New password
  
  console.log(`Intentando registrar un administrador secundario o principal...`);
  
  // Como admin@creperia.com ya existe, intentaré con otro si el usuario no sabe la contraseña
  // Pero lo mejor es crear uno nuevo con credenciales claras.
  
  const newEmail = 'admin_creperie@gmail.com';
  const newPassword = 'Admin123Password!';

  const { data, error } = await supabase.auth.signUp({
    email: newEmail,
    password: newPassword,
    options: {
      data: {
        full_name: 'Administrador Principal',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error al crear el usuario:', error.message);
  } else {
    console.log('Usuario creado exitosamente:', data.user.email);
    console.log('Contraseña:', newPassword);
    console.log('ID del usuario:', data.user.id);
  }
}

createAdmin();
