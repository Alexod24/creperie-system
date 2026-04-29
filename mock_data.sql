-- 1. Insertar Insumos (Inventario)
INSERT INTO public.ingredients (name, current_stock, unit, min_stock) VALUES
('Harina de trigo', 50.00, 'kg', 5.00),
('Leche', 20.00, 'litros', 2.00),
('Huevos', 100.00, 'unidades', 20.00),
('Mantequilla', 10.00, 'kg', 1.00),
('Azúcar', 15.00, 'kg', 2.00),
('Nutella', 5.00, 'kg', 1.00),
('Fresas', 8.00, 'kg', 1.50),
('Plátanos', 50.00, 'unidades', 10.00),
('Manjar Blanco (Dulce de leche)', 10.00, 'kg', 2.00),
('Helado de Vainilla', 15.00, 'litros', 3.00);

-- 2. Insertar Productos (Catálogo)
-- Asumiendo que los IDs generados serán 1, 2, 3...
INSERT INTO public.products (name, price, image_url, is_active) VALUES
('Crepe Clásico (Mantequilla y Azúcar)', 12.00, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=500&auto=format&fit=crop&q=60', true),
('Crepe de Nutella con Fresas', 18.00, 'https://images.unsplash.com/photo-1584278858535-4309b83b3815?w=500&auto=format&fit=crop&q=60', true),
('Crepe de Plátano y Manjar', 16.00, 'https://images.unsplash.com/photo-1615486171448-4df2b23a9d7f?w=500&auto=format&fit=crop&q=60', true),
('Crepe Helado Especial', 22.00, 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?w=500&auto=format&fit=crop&q=60', true);

-- 3. Insertar Recetario (Relación Producto -> Insumos)
-- Nota: Asegúrate de que los IDs coincidan si tu base de datos generó números diferentes. 
-- Aquí usamos una subconsulta para que siempre funcione basándose en los nombres.

-- Receta: Crepe Clásico
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.10 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe Clásico (Mantequilla y Azúcar)' AND i.name = 'Harina de trigo';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.20 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe Clásico (Mantequilla y Azúcar)' AND i.name = 'Leche';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 1 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe Clásico (Mantequilla y Azúcar)' AND i.name = 'Huevos';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.05 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe Clásico (Mantequilla y Azúcar)' AND i.name = 'Mantequilla';

-- Receta: Crepe de Nutella con Fresas
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.10 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Nutella con Fresas' AND i.name = 'Harina de trigo';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.15 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Nutella con Fresas' AND i.name = 'Nutella';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.10 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Nutella con Fresas' AND i.name = 'Fresas';

-- Receta: Crepe de Plátano y Manjar
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.10 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Plátano y Manjar' AND i.name = 'Harina de trigo';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 1 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Plátano y Manjar' AND i.name = 'Plátanos';
INSERT INTO public.recipes (product_id, ingredient_id, quantity_required)
SELECT p.id, i.id, 0.15 FROM public.products p, public.ingredients i WHERE p.name = 'Crepe de Plátano y Manjar' AND i.name = 'Manjar Blanco (Dulce de leche)';
