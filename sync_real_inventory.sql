-- Sincronización Maestra de Inventario: "Gustitos del Virrey" v2.1 (Corrección de Duplicados)
-- Configurado para evitar errores de restricción única.

-- 1. Limpiar datos antiguos
TRUNCATE TABLE public.recipes CASCADE;
TRUNCATE TABLE public.inventory_movements CASCADE;
TRUNCATE TABLE public.ingredients CASCADE;

-- 2. Insumos con stock inicial realista
INSERT INTO public.ingredients (name, current_stock, unit, min_stock, cost_per_unit) VALUES
-- Repostería y Dulces
('Masa de Crepa (Porción)', 120, 'unidades', 20, 0.45),
('Masa de Wafle (Porción)', 100, 'unidades', 15, 0.55),
('Manjar Blanco', 10, 'kg', 2, 14.50),
('Fudge de Chocolate (Fosh)', 10, 'kg', 2, 17.00),
('Crema Chantilly', 6, 'kg', 1.5, 20.00),
('Helado de Vainilla', 20, 'litros', 4, 11.50),
('Cono de Galleta (Wafle)', 50, 'unidades', 10, 0.40),
('Fresa Picada', 12, 'kg', 3, 6.50),
('Galleta Oreo', 60, 'paquetes', 12, 0.75),
('Miel de Abeja', 3, 'kg', 1, 22.00),

-- Salados y Shawarma
('Pollo Shawarma (Marinado/Cocido)', 15, 'kg', 5, 26.00),
('Pan Pita (Shawarma)', 80, 'unidades', 20, 0.65),
('Jamón Inglés Especial', 8, 'kg', 2, 22.00),
('Queso Edam Rayado', 8, 'kg', 2, 30.00),
('Tocino Ahumado', 4, 'kg', 1, 42.00),
('Huevo Grande', 120, 'unidades', 30, 0.45),
('Papas al Hilo (Bolsa 1kg)', 10, 'kg', 2, 12.00),
('Lechuga Orgánica Picada', 6, 'kg', 2, 4.50),
('Crema de Ajo y Mostaza', 4, 'litros', 1, 9.00),

-- Bebidas, Cafetería e Infusiones
('Leche Entera (Caja 1L)', 36, 'litros', 12, 4.20),
('Base Polvo para Frappe', 8, 'kg', 2, 32.00),
('Café Molido Premium', 5, 'kg', 1, 45.00),
('Jarabe de Caramelo', 2, 'litros', 0.5, 28.00),
('Filtrante Té', 50, 'unidades', 10, 0.15),
('Filtrante Anís', 50, 'unidades', 10, 0.15),
('Filtrante Manzanilla', 50, 'unidades', 10, 0.15),
('Canela en Rama', 1, 'kg', 0.2, 55.00),
('Azúcar Blanca (Sobres)', 500, 'unidades', 100, 0.05),

-- Frutas Frescas para Jugos
('Papaya Maradol', 15, 'kg', 4, 3.50),
('Piña Golden', 15, 'kg', 4, 4.00),
('Naranja para Jugo', 30, 'kg', 10, 2.50),
('Lúcuma de Seda', 8, 'kg', 2, 10.00),

-- Descartables
('Vaso Domo 8oz', 100, 'unidades', 25, 0.25),
('Vaso Domo 10oz', 100, 'unidades', 25, 0.28),
('Vaso Domo 12oz', 100, 'unidades', 25, 0.30),
('Vaso Térmico para Calientes', 150, 'unidades', 40, 0.20),
('Servilletas (Paquete)', 20, 'unidades', 5, 2.50);

-- 3. Generación de Recetas basadas en tu lista exacta
DO $$
DECLARE
    prod RECORD;
    i_crepa INT; i_wafle INT; i_manjar INT; i_fudge INT; i_chantilly INT;
    i_helado INT; i_cono INT; i_fresa INT; i_oreo INT; i_miel INT;
    i_pollo INT; i_pita INT; i_jamon INT; i_queso INT; i_tocino INT;
    i_huevo INT; i_papas INT; i_lechuga INT; i_ajo INT;
    i_leche INT; i_base INT; i_cafe INT; i_caramelo INT;
    i_te INT; i_anis INT; i_manza INT; i_canela INT; i_azucar INT;
    i_papaya INT; i_pina INT; i_naranja INT; i_lucuma INT;
    i_v8 INT; i_v10 INT; i_v12 INT; i_v_cal INT;
BEGIN
    -- Capturar IDs
    SELECT id INTO i_crepa FROM ingredients WHERE name = 'Masa de Crepa (Porción)';
    SELECT id INTO i_wafle FROM ingredients WHERE name = 'Masa de Wafle (Porción)';
    SELECT id INTO i_manjar FROM ingredients WHERE name = 'Manjar Blanco';
    SELECT id INTO i_fudge FROM ingredients WHERE name = 'Fudge de Chocolate (Fosh)';
    SELECT id INTO i_chantilly FROM ingredients WHERE name = 'Crema Chantilly';
    SELECT id INTO i_helado FROM ingredients WHERE name = 'Helado de Vainilla';
    SELECT id INTO i_cono FROM ingredients WHERE name = 'Cono de Galleta (Wafle)';
    SELECT id INTO i_fresa FROM ingredients WHERE name = 'Fresa Picada';
    SELECT id INTO i_oreo FROM ingredients WHERE name = 'Galleta Oreo';
    SELECT id INTO i_miel FROM ingredients WHERE name = 'Miel de Abeja';
    SELECT id INTO i_pollo FROM ingredients WHERE name = 'Pollo Shawarma (Marinado/Cocido)';
    SELECT id INTO i_pita FROM ingredients WHERE name = 'Pan Pita (Shawarma)';
    SELECT id INTO i_jamon FROM ingredients WHERE name = 'Jamón Inglés Especial';
    SELECT id INTO i_queso FROM ingredients WHERE name = 'Queso Edam Rayado';
    SELECT id INTO i_tocino FROM ingredients WHERE name = 'Tocino Ahumado';
    SELECT id INTO i_huevo FROM ingredients WHERE name = 'Huevo Grande';
    SELECT id INTO i_papas FROM ingredients WHERE name = 'Papas al Hilo (Bolsa 1kg)';
    SELECT id INTO i_lechuga FROM ingredients WHERE name = 'Lechuga Orgánica Picada';
    SELECT id INTO i_ajo FROM ingredients WHERE name = 'Crema de Ajo y Mostaza';
    SELECT id INTO i_leche FROM ingredients WHERE name = 'Leche Entera (Caja 1L)';
    SELECT id INTO i_base FROM ingredients WHERE name = 'Base Polvo para Frappe';
    SELECT id INTO i_cafe FROM ingredients WHERE name = 'Café Molido Premium';
    SELECT id INTO i_caramelo FROM ingredients WHERE name = 'Jarabe de Caramelo';
    SELECT id INTO i_te FROM ingredients WHERE name = 'Filtrante Té';
    SELECT id INTO i_anis FROM ingredients WHERE name = 'Filtrante Anís';
    SELECT id INTO i_manza FROM ingredients WHERE name = 'Filtrante Manzanilla';
    SELECT id INTO i_canela FROM ingredients WHERE name = 'Canela en Rama';
    SELECT id INTO i_azucar FROM ingredients WHERE name = 'Azúcar Blanca (Sobres)';
    SELECT id INTO i_papaya FROM ingredients WHERE name = 'Papaya Maradol';
    SELECT id INTO i_pina FROM ingredients WHERE name = 'Piña Golden';
    SELECT id INTO i_naranja FROM ingredients WHERE name = 'Naranja para Jugo';
    SELECT id INTO i_lucuma FROM ingredients WHERE name = 'Lúcuma de Seda';
    SELECT id INTO i_v8 FROM ingredients WHERE name = 'Vaso Domo 8oz';
    SELECT id INTO i_v10 FROM ingredients WHERE name = 'Vaso Domo 10oz';
    SELECT id INTO i_v12 FROM ingredients WHERE name = 'Vaso Domo 12oz';
    SELECT id INTO i_v_cal FROM ingredients WHERE name = 'Vaso Térmico para Calientes';

    FOR prod IN SELECT id, name FROM public.products LOOP
        
        -- 1. ADICIONALES (Regla prioritaria y exclusiva para evitar duplicados)
        IF prod.name ILIKE '%ADICIONAL%' THEN
            IF prod.name ILIKE '%QUESO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_queso, 0.05) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%HUEVO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_huevo, 1) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%TOCINO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_tocino, 0.05) ON CONFLICT DO NOTHING; END IF;
            CONTINUE; -- Saltar al siguiente producto para no entrar en reglas generales
        END IF;

        -- 2. INFUSIONES Y CALIENTES
        IF prod.name ~* 'INFUSIÓN|TÉ|ANÍS|MANZANILLA|CAFÉ PASADO|CALIENTE' THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_v_cal, 1) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_azucar, 2) ON CONFLICT DO NOTHING;
            IF prod.name ILIKE '%TÉ%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_te, 1) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%ANÍS%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_anis, 1) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%MANZANILLA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_manza, 1) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%CANELA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_canela, 0.01) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%CAFÉ PASADO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_cafe, 0.02) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%NARANJA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_naranja, 0.3) ON CONFLICT DO NOTHING; END IF;
        END IF;

        -- 3. FRAPPES Y MILKSHAKES
        IF prod.name ~* 'FRAPPE|MILKSHAKE' THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_v12, 1) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_leche, 0.25) ON CONFLICT DO NOTHING;
            IF prod.name ILIKE '%FRAPPE%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_base, 0.04) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%OREO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_oreo, 1) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%CARAMELO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_caramelo, 0.02) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%MILKSHAKE%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_helado, 0.15) ON CONFLICT DO NOTHING; END IF;
        END IF;

        -- 4. FRESAS CON CREMA (Por tamaño)
        IF prod.name ILIKE '%FRESAS CON CREMA%' THEN
            IF prod.name ILIKE '%8 OZ%' THEN 
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_v8, 1) ON CONFLICT DO NOTHING;
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_fresa, 0.15) ON CONFLICT DO NOTHING;
            ELSIF prod.name ILIKE '%10 OZ%' THEN 
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_v10, 1) ON CONFLICT DO NOTHING;
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_fresa, 0.20) ON CONFLICT DO NOTHING;
            ELSIF prod.name ILIKE '%12 OZ%' THEN 
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_v12, 1) ON CONFLICT DO NOTHING;
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_fresa, 0.25) ON CONFLICT DO NOTHING;
            END IF;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_chantilly, 0.08) ON CONFLICT DO NOTHING;
        END IF;

        -- 5. CREPAS Y WAFLES
        IF prod.name ILIKE '%CREPA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_crepa, 1) ON CONFLICT DO NOTHING; END IF;
        IF prod.name ILIKE '%WAFLE%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_wafle, 1) ON CONFLICT DO NOTHING; END IF;
        
        -- Lógica Dulce
        IF (prod.name ~* 'DULCE|MÉDIUM|PREMIUM|VIRREY|CLÁSICO') AND (prod.name !~* 'SALADA|SALADO') THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_manjar, 0.04) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_fudge, 0.02) ON CONFLICT DO NOTHING;
            IF prod.name ~* 'PREMIUM|VIRREY' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_helado, 0.12) ON CONFLICT DO NOTHING; END IF;
        END IF;

        -- Lógica Salada (Solo si no es Adicional)
        IF (prod.name ~* 'SALADA|SALADO|JAMÓN|QUESO') AND (prod.name !~* 'ADICIONAL') THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_jamon, 0.05) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_queso, 0.05) ON CONFLICT DO NOTHING;
            IF prod.name ILIKE '%VIRREY%' OR prod.name ILIKE '%POLLO%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_pollo, 0.1) ON CONFLICT DO NOTHING; END IF;
        END IF;

        -- 6. SHAWARMA
        IF prod.name ILIKE '%SHAWARMA%' THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_pita, 1) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_pollo, 0.18) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_papas, 0.04) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_lechuga, 0.05) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_ajo, 0.03) ON CONFLICT DO NOTHING;
            IF prod.name ILIKE '%MIXTO%' THEN
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_jamon, 0.04) ON CONFLICT DO NOTHING;
                INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_queso, 0.04) ON CONFLICT DO NOTHING;
            END IF;
        END IF;

        -- 7. JUGOS
        IF prod.name ILIKE '%JUGO%' THEN
            IF prod.name ILIKE '%PAPAYA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_papaya, 0.25) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%PIÑA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_pina, 0.25) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%NARANJA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_naranja, 0.35) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%LÚCUMA%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_lucuma, 0.15) ON CONFLICT DO NOTHING; END IF;
            IF prod.name ILIKE '%LECHE%' THEN INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_leche, 0.15) ON CONFLICT DO NOTHING; END IF;
        END IF;

        -- 8. CONO DE HELADO
        IF prod.name ILIKE '%CONO DE HELADO%' THEN
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_cono, 1) ON CONFLICT DO NOTHING;
            INSERT INTO recipes (product_id, ingredient_id, quantity_required) VALUES (prod.id, i_helado, 0.10) ON CONFLICT DO NOTHING;
        END IF;

    END LOOP;
END $$;
