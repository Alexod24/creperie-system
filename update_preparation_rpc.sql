-- Función mejorada para procesar una preparación con soporte para stock negativo (opcional)
-- p_ignore_stock: Si es TRUE, permite que el inventario baje de cero.

CREATE OR REPLACE FUNCTION public.process_preparation(
  p_product_id INTEGER, 
  p_quantity INTEGER, 
  p_user_id UUID,
  p_ignore_stock BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipe_item RECORD;
  current_ingredient_stock NUMERIC;
BEGIN
  -- 1. Verificar stock si p_ignore_stock es FALSE
  IF NOT p_ignore_stock THEN
    FOR recipe_item IN 
      SELECT ingredient_id, quantity_required 
      FROM public.recipes 
      WHERE product_id = p_product_id
    LOOP
      SELECT current_stock INTO current_ingredient_stock 
      FROM public.ingredients 
      WHERE id = recipe_item.ingredient_id;

      IF current_ingredient_stock < (recipe_item.quantity_required * p_quantity) THEN
        RAISE EXCEPTION 'Stock insuficiente para el insumo ID %', recipe_item.ingredient_id;
      END IF;
    END LOOP;
  END IF;

  -- 2. Restar stock de los insumos y registrar movimiento
  FOR recipe_item IN 
    SELECT ingredient_id, quantity_required 
    FROM public.recipes 
    WHERE product_id = p_product_id
  LOOP
    INSERT INTO public.inventory_movements (
      ingredient_id, 
      movement_type, 
      quantity, 
      user_id, 
      notes
    )
    VALUES (
      recipe_item.ingredient_id, 
      'preparacion', 
      recipe_item.quantity_required * p_quantity, 
      p_user_id, 
      'Preparación de producto ID ' || p_product_id || (CASE WHEN p_ignore_stock THEN ' (FORZADO - STOCK INSUFICIENTE)' ELSE '' END)
    );
  END LOOP;

  -- 3. Aumentar stock del producto preparado
  UPDATE public.products 
  SET stock = COALESCE(stock, 0) + p_quantity
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;
