-- Función para procesar una preparación
-- Aumenta stock del producto y reduce stock de los insumos según la receta

CREATE OR REPLACE FUNCTION public.process_preparation(p_product_id INTEGER, p_quantity INTEGER, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipe_item RECORD;
  current_ingredient_stock NUMERIC;
BEGIN
  -- 1. Verificar que haya suficiente stock de todos los insumos primero
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

  -- 2. Restar stock de los insumos y registrar movimiento
  FOR recipe_item IN 
    SELECT ingredient_id, quantity_required 
    FROM public.recipes 
    WHERE product_id = p_product_id
  LOOP
    -- Descontar inventario
    -- Nota: El trigger trigger_update_inventory_stock se encargará de actualizar public.ingredients
    -- si insertamos en inventory_movements con tipo 'preparacion'.
    -- En nuestro schema anterior, el trigger resta si no es 'entrada'.
    
    INSERT INTO public.inventory_movements (ingredient_id, movement_type, quantity, user_id, notes)
    VALUES (recipe_item.ingredient_id, 'preparacion', recipe_item.quantity_required * p_quantity, p_user_id, 'Preparación de producto ID ' || p_product_id);
  END LOOP;

  -- 3. Aumentar stock del producto
  UPDATE public.products 
  SET stock = COALESCE(stock, 0) + p_quantity
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;
