/*
  # Crear tabla de productos

  1. Nueva Tabla
    - `productos`
      - `id` (uuid, primary key)
      - `codigo` (text, unique, auto-generado)
      - `nombre` (text, nombre del producto)
      - `categoria` (text, tipo/categoría del producto)
      - `talle` (text, talle del producto)
      - `color` (text, color del producto)
      - `stock` (integer, cantidad en stock)
      - `precio_costo` (numeric, precio de costo en USD)
      - `precio_venta` (numeric, precio de venta sugerido)
      - `margen_porcentaje` (numeric, calculado automáticamente)
      - `stock_minimo` (integer, umbral de stock bajo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `productos`
    - Agregar política para acceso público (temporal para desarrollo)

  3. Funciones
    - Función para generar código único de producto
    - Trigger para actualizar updated_at automáticamente
    - Trigger para generar código si no se proporciona
*/

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para generar código único de producto
CREATE OR REPLACE FUNCTION generate_producto_codigo()
RETURNS TRIGGER AS $$
DECLARE
    new_codigo TEXT;
    categoria_prefix TEXT;
BEGIN
    -- Generar prefijo basado en categoría
    categoria_prefix := CASE 
        WHEN NEW.categoria = 'Camiseta' THEN 'CAM'
        WHEN NEW.categoria = 'Pantalón' THEN 'PAN'
        WHEN NEW.categoria = 'Buzo' THEN 'BUZ'
        WHEN NEW.categoria = 'Zapatillas' THEN 'ZAP'
        WHEN NEW.categoria = 'Vestido' THEN 'VES'
        WHEN NEW.categoria = 'Shorts' THEN 'SHO'
        WHEN NEW.categoria = 'Campera' THEN 'CAP'
        WHEN NEW.categoria = 'Remera' THEN 'REM'
        WHEN NEW.categoria = 'Jeans' THEN 'JEA'
        WHEN NEW.categoria = 'Hoodie' THEN 'HOO'
        ELSE 'PRD'
    END;
    
    -- Generar código único
    new_codigo := categoria_prefix || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    
    -- Asegurar unicidad
    WHILE EXISTS (SELECT 1 FROM productos WHERE codigo = new_codigo) LOOP
        new_codigo := categoria_prefix || '-' || LPAD((EXTRACT(EPOCH FROM NOW()) + RANDOM() * 1000)::INTEGER::TEXT, 10, '0');
    END LOOP;
    
    NEW.codigo := new_codigo;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text UNIQUE NOT NULL,
    nombre text NOT NULL,
    categoria text NOT NULL,
    talle text NOT NULL,
    color text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    precio_costo numeric(10,2) NOT NULL,
    precio_venta numeric(10,2) NOT NULL,
    margen_porcentaje numeric(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN precio_costo > 0 THEN ((precio_venta - precio_costo) / precio_costo * 100)
            ELSE 0
        END
    ) STORED,
    stock_minimo integer DEFAULT 2,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Política para acceso público (para desarrollo)
CREATE POLICY "Productos públicos"
    ON productos
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_producto_codigo_trigger
    BEFORE INSERT ON productos
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION generate_producto_codigo();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);