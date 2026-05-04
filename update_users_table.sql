-- EJECUTAR ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE

-- 1. Añadir nuevas columnas a la tabla users para el detalle de empleados
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS shift TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS schedule TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);

-- 2. Asegurar que el usuario administrador tenga privilegios de 'admin'
-- Reemplaza con el correo correcto si es necesario
UPDATE public.users SET role = 'admin' WHERE email = 'admin@creperia.com';

-- 3. (Opcional) Si quieres que otros correos también sean admin, puedes añadirlos aquí
-- UPDATE public.users SET role = 'admin' WHERE email = 'otro_admin@creperia.com';
