-- Migración: Soporte para Yape y Desglose de Caja

-- 1. Actualizar tabla de ventas
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'efectivo' CHECK (payment_method IN ('efectivo', 'yape'));
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- 2. Actualizar tabla de sesiones de caja para guardar el desglose final
ALTER TABLE public.cash_sessions ADD COLUMN IF NOT EXISTS cash_sales_total NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.cash_sessions ADD COLUMN IF NOT EXISTS yape_sales_total NUMERIC(10, 2) DEFAULT 0;

-- 3. Actualizar función de totales de sesión para incluir desglose
DROP FUNCTION IF EXISTS public.get_session_totals(INTEGER);

CREATE OR REPLACE FUNCTION public.get_session_totals(p_session_id INTEGER)
RETURNS TABLE (
    sales_total NUMERIC(10, 2),
    cash_total NUMERIC(10, 2),
    yape_total NUMERIC(10, 2),
    sales_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'efectivo' THEN total ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'yape' THEN total ELSE 0 END), 0),
        COUNT(*)::INTEGER
    FROM public.sales
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;
