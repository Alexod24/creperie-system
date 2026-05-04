
-- Migración: Módulo de Mermas
-- Este script crea la infraestructura para el registro de mermas (insumos perdidos/malogrados)

-- 1. Actualizar el CHECK de inventory_movements para permitir 'merma'
ALTER TABLE public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_movement_type_check;
ALTER TABLE public.inventory_movements ADD CONSTRAINT inventory_movements_movement_type_check 
  CHECK (movement_type IN ('entrada', 'salida', 'preparacion', 'venta', 'merma'));

-- 2. Crear la tabla de mermas
CREATE TABLE IF NOT EXISTS public.mermas (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES public.ingredients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  quantity NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL, -- 'Malogrado', 'Vencido', 'Accidente', 'Otro'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.mermas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to authenticated users" ON public.mermas
    FOR ALL USING (auth.role() = 'authenticated');
