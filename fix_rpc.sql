-- Actualización de process_preparation para evitar error de Llave Foránea
CREATE OR REPLACE FUNCTION public.process_preparation(p_product_id INTEGER, p_quantity INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipe_item RECORD;
  current_ingredient_stock NUMERIC;
  v_real_user_id UUID;
BEGIN
  -- Verificamos si el usuario de la sesión realmente existe en la tabla public.users
  -- Si no existe (porque se creó antes de configurar los triggers), registramos el movimiento como NULL (Sistema)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    v_real_user_id := p_user_id;
  ELSE
    v_real_user_id := NULL;
  END IF;

  -- 1. Verificar stock
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    SELECT current_stock INTO current_ingredient_stock FROM public.ingredients WHERE id = recipe_item.ingredient_id;
    IF current_ingredient_stock < (recipe_item.quantity_required * p_quantity) THEN
      RAISE EXCEPTION 'Stock insuficiente';
    END IF;
  END LOOP;

  -- 2. Restar insumos y registrar movimiento de salida
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    INSERT INTO public.inventory_movements (ingredient_id, movement_type, quantity, user_id, notes)
    VALUES (recipe_item.ingredient_id, 'preparacion', recipe_item.quantity_required * p_quantity, v_real_user_id, 'Preparación descontada');
  END LOOP;

  -- 3. Aumentar stock del producto (Catálogo)
  UPDATE public.products SET stock = COALESCE(stock, 0) + p_quantity WHERE id = p_product_id;

  -- 4. Registrar la ENTRADA del producto preparado
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, user_id, notes)
  VALUES (p_product_id, 'entrada', p_quantity, v_real_user_id, 'Producto preparado y añadido al catálogo');

  RETURN TRUE;
END;
$$;
