-- Actualización de la función process_preparation para que SÍ sume el stock al producto terminado
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
  v_batch_id UUID;
  v_product_name TEXT;
BEGIN
  v_batch_id := gen_random_uuid();
  
  -- Obtener nombre del producto
  SELECT name INTO v_product_name FROM public.products WHERE id = p_product_id;

  -- 1. Verificar stock de insumos si p_ignore_stock es FALSE
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

  -- 2. SUMAR STOCK AL PRODUCTO TERMINADO (ESTO ERA LO QUE FALTABA)
  UPDATE public.products 
  SET stock = stock + p_quantity 
  WHERE id = p_product_id;

  -- 3. Registrar la ENTRADA del producto en el historial
  INSERT INTO public.inventory_movements (
    product_id, 
    movement_type, 
    quantity, 
    user_id, 
    notes,
    batch_id
  ) VALUES (
    p_product_id, 
    'entrada', 
    p_quantity, 
    p_user_id, 
    CASE WHEN p_ignore_stock THEN '(FORZADO) Preparación de ' || v_product_name ELSE 'Preparación de ' || v_product_name END,
    v_batch_id
  );

  -- 4. Restar stock de los insumos y registrar movimientos de salida
  FOR recipe_item IN 
    SELECT r.ingredient_id, r.quantity_required, i.name as ing_name
    FROM public.recipes r
    JOIN public.ingredients i ON i.id = r.ingredient_id
    WHERE r.product_id = p_product_id
  LOOP
    -- Actualizar stock del insumo
    UPDATE public.ingredients 
    SET current_stock = current_stock - (recipe_item.quantity_required * p_quantity)
    WHERE id = recipe_item.ingredient_id;

    -- Registrar movimiento de salida del insumo
    INSERT INTO public.inventory_movements (
      ingredient_id, 
      movement_type, 
      quantity, 
      user_id, 
      notes,
      batch_id
    ) VALUES (
      recipe_item.ingredient_id, 
      'preparacion', 
      recipe_item.quantity_required * p_quantity, 
      p_user_id, 
      'Insumo para ' || v_product_name,
      v_batch_id
    );
  END LOOP;

  RETURN TRUE;
END;
$$;
