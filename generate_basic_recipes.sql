-- Script para generar insumos y recetas básicas
-- ATENCIÓN: Esto borrará todas las recetas e insumos existentes para crear los nuevos basados en tu carta actual.

-- 1. Limpiar tablas relacionadas
TRUNCATE TABLE public.recipes CASCADE;
TRUNCATE TABLE public.ingredients CASCADE;

-- 2. Insertar Insumos Básicos
INSERT INTO public.ingredients (name, current_stock, unit, min_stock) VALUES
('Vasos (Frappe/Milkshake/Jugos)', 100, 'unidades', 20),
('Leche', 20, 'litros', 5),
('Fresas', 10, 'kg', 2),
('Papaya', 5, 'kg', 2),
('Piña', 5, 'kg', 2),
('Naranja', 10, 'kg', 3),
('Lúcuma', 5, 'kg', 2),
('Crema Chantilly', 5, 'kg', 1),
('Helado', 10, 'litros', 2),
('Saborizante/Polvo Frappe', 5, 'kg', 1),
('Galleta Oreo', 50, 'paquetes', 10),
('Masa de Crepa (Porción)', 50, 'unidades', 10),
('Masa de Wafle (Porción)', 50, 'unidades', 10),
('Pan Pita (Shawarma)', 50, 'unidades', 10),
('Pollo Filete', 10, 'kg', 3),
('Queso Edam/Mozzarella', 5, 'kg', 1),
('Jamón', 5, 'kg', 1),
('Tocino', 2, 'kg', 0.5),
('Huevo', 60, 'unidades', 15),
('Papas al Hilo', 5, 'kg', 1),
('Lechuga', 3, 'kg', 1),
('Manjar Blanco', 5, 'kg', 1),
('Fudge (Fosh)', 5, 'kg', 1);

-- 3. Crear Recetas dinámicamente basadas en el nombre del producto
DO $$
DECLARE
    prod RECORD;
    ing_vaso INTEGER;
    ing_leche INTEGER;
    ing_fresa INTEGER;
    ing_papaya INTEGER;
    ing_pina INTEGER;
    ing_naranja INTEGER;
    ing_lucuma INTEGER;
    ing_chantilly INTEGER;
    ing_helado INTEGER;
    ing_saborizante INTEGER;
    ing_oreo INTEGER;
    ing_crepa INTEGER;
    ing_wafle INTEGER;
    ing_pita INTEGER;
    ing_pollo INTEGER;
    ing_queso INTEGER;
    ing_jamon INTEGER;
    ing_tocino INTEGER;
    ing_huevo INTEGER;
    ing_papas INTEGER;
    ing_lechuga INTEGER;
    ing_manjar INTEGER;
    ing_fudge INTEGER;
BEGIN
    -- Obtener IDs de los insumos
    SELECT id INTO ing_vaso FROM public.ingredients WHERE name = 'Vasos (Frappe/Milkshake/Jugos)' LIMIT 1;
    SELECT id INTO ing_leche FROM public.ingredients WHERE name = 'Leche' LIMIT 1;
    SELECT id INTO ing_fresa FROM public.ingredients WHERE name = 'Fresas' LIMIT 1;
    SELECT id INTO ing_papaya FROM public.ingredients WHERE name = 'Papaya' LIMIT 1;
    SELECT id INTO ing_pina FROM public.ingredients WHERE name = 'Piña' LIMIT 1;
    SELECT id INTO ing_naranja FROM public.ingredients WHERE name = 'Naranja' LIMIT 1;
    SELECT id INTO ing_lucuma FROM public.ingredients WHERE name = 'Lúcuma' LIMIT 1;
    SELECT id INTO ing_chantilly FROM public.ingredients WHERE name = 'Crema Chantilly' LIMIT 1;
    SELECT id INTO ing_helado FROM public.ingredients WHERE name = 'Helado' LIMIT 1;
    SELECT id INTO ing_saborizante FROM public.ingredients WHERE name = 'Saborizante/Polvo Frappe' LIMIT 1;
    SELECT id INTO ing_oreo FROM public.ingredients WHERE name = 'Galleta Oreo' LIMIT 1;
    SELECT id INTO ing_crepa FROM public.ingredients WHERE name = 'Masa de Crepa (Porción)' LIMIT 1;
    SELECT id INTO ing_wafle FROM public.ingredients WHERE name = 'Masa de Wafle (Porción)' LIMIT 1;
    SELECT id INTO ing_pita FROM public.ingredients WHERE name = 'Pan Pita (Shawarma)' LIMIT 1;
    SELECT id INTO ing_pollo FROM public.ingredients WHERE name = 'Pollo Filete' LIMIT 1;
    SELECT id INTO ing_queso FROM public.ingredients WHERE name = 'Queso Edam/Mozzarella' LIMIT 1;
    SELECT id INTO ing_jamon FROM public.ingredients WHERE name = 'Jamón' LIMIT 1;
    SELECT id INTO ing_tocino FROM public.ingredients WHERE name = 'Tocino' LIMIT 1;
    SELECT id INTO ing_huevo FROM public.ingredients WHERE name = 'Huevo' LIMIT 1;
    SELECT id INTO ing_papas FROM public.ingredients WHERE name = 'Papas al Hilo' LIMIT 1;
    SELECT id INTO ing_lechuga FROM public.ingredients WHERE name = 'Lechuga' LIMIT 1;
    SELECT id INTO ing_manjar FROM public.ingredients WHERE name = 'Manjar Blanco' LIMIT 1;
    SELECT id INTO ing_fudge FROM public.ingredients WHERE name = 'Fudge (Fosh)' LIMIT 1;

    -- Iterar sobre todos los productos y crear la receta base
    FOR prod IN SELECT id, name FROM public.products LOOP
        
        -- FRAPPES Y MILKSHAKES
        IF prod.name ILIKE '%FRAPPE%' OR prod.name ILIKE '%MILKSHAKE%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_vaso, 1);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_leche, 0.2); -- 200ml
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_saborizante, 0.05); -- 50g
            
            IF prod.name ILIKE '%FRESA%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_fresa, 0.1); -- 100g
            END IF;
            IF prod.name ILIKE '%OREO%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_oreo, 1); -- 1 paquete
            END IF;
            IF prod.name ILIKE '%MILKSHAKE%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_helado, 0.15); -- 150ml
            END IF;
        
        -- FRESAS CON CREMA
        ELSIF prod.name ILIKE '%FRESAS CON CREMA%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_vaso, 1);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_fresa, 0.2); -- 200g
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_chantilly, 0.1); -- 100g
        
        -- CALIENTITO / JUGOS
        ELSIF prod.name ILIKE '%JUGO%' OR prod.name ILIKE '%CALIENTE%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_vaso, 1);
            
            IF prod.name ILIKE '%PAPAYA%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_papaya, 0.2);
            END IF;
            IF prod.name ILIKE '%PIÑA%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_pina, 0.2);
            END IF;
            IF prod.name ILIKE '%NARANJA%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_naranja, 0.3);
            END IF;
            IF prod.name ILIKE '%LÚCUMA%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_lucuma, 0.15);
            END IF;
            IF prod.name ILIKE '%LECHE%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_leche, 0.1);
            END IF;

        -- CREPAS
        ELSIF prod.name ILIKE '%CREPA%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_crepa, 1);
            
            IF prod.name ILIKE '%DULCE%' OR prod.name ILIKE '%MÉDIUM%' OR prod.name ILIKE '%PREMIUM%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_manjar, 0.05);
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_fudge, 0.03);
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_chantilly, 0.05);
            END IF;

            IF prod.name ILIKE '%SALADA%' OR prod.name ILIKE '%JAMÓN%' OR prod.name ILIKE '%QUESO%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_jamon, 0.05);
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_queso, 0.05);
            END IF;

            IF prod.name ILIKE '%POLLO%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_pollo, 0.1);
            END IF;

        -- WAFLES
        ELSIF prod.name ILIKE '%WAFLE%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_wafle, 1);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_manjar, 0.05);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_fudge, 0.03);

        -- SHAWARMA
        ELSIF prod.name ILIKE '%SHAWARMA%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_pita, 1);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_pollo, 0.15);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_lechuga, 0.05);
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_papas, 0.05);
            
            IF prod.name ILIKE '%MIXTO%' THEN
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_jamon, 0.05);
                INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_queso, 0.05);
            END IF;

        -- ADICIONALES
        ELSIF prod.name ILIKE '%ADICIONAL QUESO%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_queso, 0.05);
        ELSIF prod.name ILIKE '%ADICIONAL HUEVO%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_huevo, 1);
        ELSIF prod.name ILIKE '%ADICIONAL TOCINO%' THEN
            INSERT INTO public.recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, ing_tocino, 0.05);
        
        -- POR DEFECTO PARA EL RESTO: Al menos vinculamos algo para que no falle la preparación
        ELSE
            -- Insumo genérico o dejarlo sin receta (pero si no tiene receta fallará la preparación)
            -- Como es un demo, es mejor que todo producto tenga alguna receta.
            -- Lo dejaremos así, los productos que no matcheen, no tendrán receta y el administrador deberá añadirla.
        END IF;

    END LOOP;
END $$;
