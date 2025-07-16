/*
  # Crear tabla de productos

  1. Nueva Tabla
    - `productos`
      - `id` (uuid, primary key)
      - `codigo` (text, unique) - Código único del producto
      - `nombre` (text) - Nombre del producto
      - `categoria` (text) - Categoría del producto
      - `talle` (text) - Talle del producto
      - `color` (text) - Color del producto
      - `stock` (integer, default 0) - Cantidad en stock
      - `precio_costo` (numeric) - Precio de costo
      - `precio_venta` (numeric) - Precio de venta calculado
      - `margen_porcentaje` (numeric) - Margen de ganancia en porcentaje
      - `stock_minimo` (integer) - Stock mínimo para alertas
      - `created_at` (timestamp) - Fecha de creación
      - `updated_at` (timestamp) - Fecha de última actualización

  2. Seguridad
    - Habilitar RLS en tabla `productos`
    - Permitir lectura pública
    - Permitir todas las operaciones a usuarios autenticados

  3. Índices
    - Índice en código para búsquedas rápidas
    - Índice en categoría para filtros
    - Índice en stock para alertas de stock bajo

  4. Triggers
    - Trigger para actualizar `updated_at` automáticamente
    - Función para generar códigos únicos automáticamente
*/

-- Crear extensión para generar UUIDs si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para generar código único de producto
CREATE OR REPLACE FUNCTION generate_producto_codigo()
RETURNS TRIGGER AS $$
DECLARE
    new_codigo TEXT;
    counter INTEGER := 1;
BEGIN
    -- Si no se proporciona código, generar uno automáticamente
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        -- Generar código base usando las primeras letras de categoría y nombre
        new_codigo := UPPER(LEFT(NEW.categoria, 2) || LEFT(NEW.nombre, 2) || LPAD(counter::TEXT, 3, '0'));
        
        -- Verificar que el código no exista
        WHILE EXISTS (SELECT 1 FROM productos WHERE codigo = new_codigo) LOOP
            counter := counter + 1;
            new_codigo := UPPER(LEFT(NEW.categoria, 2) || LEFT(NEW.nombre, 2) || LPAD(counter::TEXT, 3, '0'));
        END LOOP;
        
        NEW.codigo := new_codigo;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo text UNIQUE NOT NULL,
    nombre text NOT NULL,
    categoria text NOT NULL,
    talle text NOT NULL,
    color text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    precio_costo numeric(10,2) NOT NULL,
    precio_venta numeric(10,2),
    margen_porcentaje numeric(5,2) DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Permitir lectura pública de productos"
    ON productos
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
    ON productos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
    ON productos
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir eliminación a usuarios autenticados"
    ON productos
    FOR DELETE
    TO authenticated
    USING (true);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_productos_talle ON productos(talle);

-- Crear triggers
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_producto_codigo_trigger
    BEFORE INSERT ON productos
    FOR EACH ROW
    EXECUTE FUNCTION generate_producto_codigo();