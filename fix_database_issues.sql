-- Archivo para solucionar problemas de permisos (RLS) y sincronización de usuarios

-- 1. Asegurar que todos los usuarios registrados estén en la tabla public.users
-- Esto soluciona el error 406 al obtener el rol y previene errores de Llave Foránea.
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  COALESCE(raw_user_meta_data->>'role', 'empleado')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 2. Deshabilitar RLS o crear políticas permisivas para el sistema interno
-- Si habilitaste RLS desde el panel de Supabase sin crear políticas, 
-- todas las operaciones (Insert/Select) serán denegadas.

-- Opción A: Deshabilitar RLS para permitir que la API funcione libremente 
-- (Recomendado si solo los empleados usarán el sistema)
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Opción B (Alternativa): Si prefieres mantener RLS activado, ejecuta esto 
-- para permitir que los usuarios autenticados hagan todo:
/*
CREATE POLICY "Permitir todo a usuarios autenticados en sales" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados en sale_items" ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados en users" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a usuarios autenticados en products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
*/
