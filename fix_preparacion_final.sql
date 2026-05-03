-- Archivo para arreglar la preparación (descuento de insumos y registro de movimientos)

-- 1. Actualizar el trigger para que no falle si insertamos un producto (ingredient_id nulo)
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizamos la tabla ingredients si el movimiento tiene un ingredient_id
  IF NEW.ingredient_id IS NOT NULL THEN
    IF NEW.movement_type = 'entrada' THEN
      UPDATE public.ingredients SET current_stock = current_stock + NEW.quantity WHERE id = NEW.ingredient_id;
    ELSE
      UPDATE public.ingredients SET current_stock = current_stock - NEW.quantity WHERE id = NEW.ingredient_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Asegurarnos de que el trigger está en la tabla (por si acaso)
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON public.inventory_movements;
CREATE TRIGGER trigger_update_inventory_stock
AFTER INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- 3. Crear el RPC robusto para la preparación
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
BEGIN
  -- Validar usuario (si existe en public.users)
  IF p_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    v_real_user_id := p_user_id;
  ELSE
    v_real_user_id := NULL;
  END IF;

  -- 1. Validar si el producto tiene receta y revisar stock
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    v_has_recipe := TRUE;
    SELECT current_stock INTO current_ingredient_stock FROM public.ingredients WHERE id = recipe_item.ingredient_id;
    
    IF current_ingredient_stock < (recipe_item.quantity_required * p_quantity) THEN
      RAISE EXCEPTION 'Stock insuficiente para preparar este producto (revisa los insumos)';
    END IF;
  END LOOP;

  IF NOT v_has_recipe THEN
    RAISE EXCEPTION 'Este producto no tiene una receta asignada. No se puede preparar sin insumos.';
  END IF;

  -- 2. Descontar insumos (el trigger update_inventory_stock se encargará de restar)
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    INSERT INTO public.inventory_movements (ingredient_id, movement_type, quantity, user_id, notes)
    VALUES (recipe_item.ingredient_id, 'preparacion', recipe_item.quantity_required * p_quantity, v_real_user_id, 'Preparación descontada (Salida)');
  END LOOP;

  -- 3. Aumentar stock del producto (Catálogo)
  UPDATE public.products SET stock = COALESCE(stock, 0) + p_quantity WHERE id = p_product_id;

  -- 4. Registrar la entrada del producto preparado (sin ingredient_id, solo product_id)
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, user_id, notes)
  VALUES (p_product_id, 'entrada', p_quantity, v_real_user_id, 'Producto preparado (Entrada)');

  RETURN TRUE;
END;
$$;
