-- Migración: Sistema de Caja y Sesiones
-- Este script crea la infraestructura para cierres de caja

-- 1. Crear la tabla de sesiones
CREATE TABLE IF NOT EXISTS public.cash_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  initial_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  expected_amount NUMERIC(10, 2),
  actual_amount NUMERIC(10, 2),
  difference NUMERIC(10, 2),
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Añadir session_id a la tabla de ventas si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='session_id') THEN
        ALTER TABLE public.sales ADD COLUMN session_id INTEGER REFERENCES public.cash_sessions(id);
    END IF;
END $$;

-- 3. Función para calcular el total de una sesión
CREATE OR REPLACE FUNCTION public.get_session_totals(p_session_id INTEGER)
RETURNS TABLE (
    sales_total NUMERIC(10, 2),
    sales_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total), 0),
        COUNT(*)::INTEGER
    FROM public.sales
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Habilitar RLS (Opcional, pero recomendado por seguridad)
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access" ON public.cash_sessions
    FOR ALL USING (auth.role() = 'authenticated');
