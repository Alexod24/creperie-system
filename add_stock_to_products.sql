-- Añadir columna de stock a la tabla de productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Para asegurar que no tengamos valores nulos
UPDATE public.products SET stock = 0 WHERE stock IS NULL;

-- Función para descontar stock del producto en las ventas
CREATE OR REPLACE FUNCTION public.decrement_product_stock(p_product_id INTEGER, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, COALESCE(stock, 0) - p_quantity)
  WHERE id = p_product_id;
END;
$$;
