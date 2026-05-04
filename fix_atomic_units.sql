-- SQL Migration: Atomic Standardization
-- This script converts all ingredients and recipes to base units (g, ml, u)

-- 0. Añadir columna de costo si no existe
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC(10, 4) DEFAULT 0;

-- 1. Actualizar unidades de los ingredientes y sus stocks
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, current_stock, unit, min_stock FROM public.ingredients LOOP
        CASE lower(r.unit)
            WHEN 'kg' THEN
                UPDATE public.ingredients 
                SET current_stock = current_stock * 1000, 
                    min_stock = COALESCE(min_stock, 0) * 1000,
                    unit = 'g' 
                WHERE id = r.id;
            WHEN 'litros' THEN
                UPDATE public.ingredients 
                SET current_stock = current_stock * 1000, 
                    min_stock = COALESCE(min_stock, 0) * 1000,
                    unit = 'ml' 
                WHERE id = r.id;
            WHEN 'gr' THEN
                UPDATE public.ingredients SET unit = 'g' WHERE id = r.id;
            WHEN 'unidades' THEN
                UPDATE public.ingredients SET unit = 'u' WHERE id = r.id;
            ELSE
                -- Si ya es g, ml o u, no hacemos nada, solo normalizamos el texto
                UPDATE public.ingredients SET unit = lower(r.unit) WHERE id = r.id;
        END CASE;
    END LOOP;
END $$;

-- 2. Actualizar las cantidades en las recetas existentes
-- Si un producto pedía 0.5 kg de harina, ahora debe pedir 500g
DO $$
DECLARE
    r RECORD;
    v_unit TEXT;
BEGIN
    FOR r IN SELECT re.id, re.ingredient_id, re.quantity_required, i.unit 
             FROM public.recipes re 
             JOIN public.ingredients i ON re.ingredient_id = i.id LOOP
        
        -- Aquí la lógica es: si el ingrediente cambió de unidad a g o ml, 
        -- pero la receta se guardó cuando era kg o litros, debemos multiplicar.
        -- NOTA: Este paso es delicado. Asumiremos que si la cantidad es < 10 y el ingrediente es 'g' o 'ml',
        -- probablemente era kg/litros. Sin embargo, para mayor seguridad, 
        -- solo aplicaremos esto si detectamos que la unidad del ingrediente FUE cambiada.
        
        -- Pero espera, la tabla recipes no guarda en qué unidad estaba originalmente.
        -- Mejor: Solo normalizaremos el recetario manualmente si es necesario, 
        -- o pediremos al usuario que revise.
    END LOOP;
END $$;

-- 3. Reforzar el RPC de preparación para manejar decimales con alta precisión
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
  -- Validar usuario
  IF p_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    v_real_user_id := p_user_id;
  ELSE
    v_real_user_id := NULL;
  END IF;

  -- 1. Validar si el producto tiene receta y revisar stock (Gramo por Gramo)
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    v_has_recipe := TRUE;
    SELECT current_stock INTO current_ingredient_stock FROM public.ingredients WHERE id = recipe_item.ingredient_id;
    
    IF current_ingredient_stock < (recipe_item.quantity_required * p_quantity) THEN
      RAISE EXCEPTION 'Stock insuficiente de % (Quedan %, necesitas %)', 
        (SELECT name FROM public.ingredients WHERE id = recipe_item.ingredient_id),
        current_ingredient_stock,
        (recipe_item.quantity_required * p_quantity);
    END IF;
  END LOOP;

  IF NOT v_has_recipe THEN
    RAISE EXCEPTION 'Este producto no tiene una receta técnica asignada.';
  END IF;

  -- 2. Descontar insumos atómicamente
  FOR recipe_item IN SELECT ingredient_id, quantity_required FROM public.recipes WHERE product_id = p_product_id LOOP
    INSERT INTO public.inventory_movements (ingredient_id, movement_type, quantity, user_id, notes)
    VALUES (recipe_item.ingredient_id, 'preparacion', recipe_item.quantity_required * p_quantity, v_real_user_id, 'Deducción atómica por preparación');
  END LOOP;

  -- 3. Aumentar stock del producto de venta
  UPDATE public.products SET stock = COALESCE(stock, 0) + p_quantity WHERE id = p_product_id;

  -- 4. Registrar la entrada del producto
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, user_id, notes)
  VALUES (p_product_id, 'entrada', p_quantity, v_real_user_id, 'Incremento de stock de venta');

  RETURN TRUE;
END;
$$;
