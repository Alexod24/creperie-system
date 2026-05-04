-- 1. Añadir batch_id a inventory_movements para agrupar movimientos relacionados
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS batch_id UUID;

-- 2. Actualizar la función de preparación para usar batch_id
CREATE OR REPLACE FUNCTION public.process_preparation(p_product_id INTEGER, p_quantity INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipe_item RECORD;
  current_ingredient_stock NUMERIC;
  v_real_user_id UUID;
  v_has_recipe BOOLEAN := FALSE;
  v_batch_id UUID := gen_random_uuid(); -- Generamos un ID único para este grupo de movimientos
BEGIN
  -- Validar usuario
  IF p_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    v_real_user_id := p_user_id;
  ELSE
    v_real_user_id := NULL;
  END IF;

  -- 1. Validar stock
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    v_has_recipe := TRUE;
    SELECT current_stock INTO current_ingredient_stock FROM public.ingredients WHERE id = recipe_item.ingredient_id;
    
    IF current_ingredient_stock < (recipe_item.quantity_required * p_quantity) THEN
      RAISE EXCEPTION 'Stock insuficiente para preparar este producto';
    END IF;
  END LOOP;

  IF NOT v_has_recipe THEN
    RAISE EXCEPTION 'Este producto no tiene una receta asignada.';
  END IF;

  -- 2. Descontar insumos con el mismo batch_id
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    INSERT INTO public.inventory_movements (ingredient_id, movement_type, quantity, user_id, notes, batch_id)
    VALUES (recipe_item.ingredient_id, 'preparacion', recipe_item.quantity_required * p_quantity, v_real_user_id, 'Insumo descontado', v_batch_id);
  END LOOP;

  -- 3. Aumentar stock del producto
  UPDATE public.products SET stock = COALESCE(stock, 0) + p_quantity WHERE id = p_product_id;

  -- 4. Registrar la entrada del producto preparado con el mismo batch_id
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, user_id, notes, batch_id)
  VALUES (p_product_id, 'entrada', p_quantity, v_real_user_id, 'Preparación terminada', v_batch_id);

  RETURN TRUE;
END;
$$;
