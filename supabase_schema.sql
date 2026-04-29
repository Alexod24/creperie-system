-- Esquema para Sistema de Crepería

-- Tabla de Usuarios (Extiende auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'empleado')) DEFAULT 'empleado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ajustes del Negocio
CREATE TABLE public.settings (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Mi Crepería',
  currency TEXT NOT NULL DEFAULT 'PEN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO public.settings (business_name, currency) VALUES ('Mi Crepería', 'PEN');

-- Tabla de Productos (Catálogo)
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Insumos (Inventario)
CREATE TABLE public.ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, -- ej. kg, gr, litros, ml, unidades
  min_stock NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Recetario (Relación Producto -> Insumos)
CREATE TABLE public.recipes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity_required NUMERIC(10, 2) NOT NULL, -- Cuánto se gasta de este insumo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)
);

-- Tabla de Ventas
CREATE TABLE public.sales (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id), -- Quién hizo la venta (ej. Bricila)
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detalles de Ventas
CREATE TABLE public.sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL
);

-- Movimientos de Inventario (Entradas/Salidas/Preparaciones)
CREATE TABLE public.inventory_movements (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES public.ingredients(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'preparacion', 'venta')),
  quantity NUMERIC(10, 2) NOT NULL,
  user_id UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar stock al insertar movimiento
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE public.ingredients SET current_stock = current_stock + NEW.quantity WHERE id = NEW.ingredient_id;
  ELSE
    UPDATE public.ingredients SET current_stock = current_stock - NEW.quantity WHERE id = NEW.ingredient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_stock
AFTER INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();
