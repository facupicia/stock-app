/*
  # Crear tabla de compras/reposición de stock

  1. Nueva Tabla
    - `compras`
      - `id` (uuid, primary key)
      - `producto_id` (uuid, foreign key a productos)
      - `cantidad` (integer, cantidad comprada)
      - `precio_unitario` (numeric, precio de compra)
      - `total` (numeric, calculado automáticamente)
      - `proveedor` (text, nombre del proveedor)
      - `fecha` (timestamp, fecha de la compra)
      - `notas` (text, notas adicionales)

  2. Seguridad
    - Habilitar RLS en tabla `compras`
    - Agregar política para acceso público

  3. Relaciones
    - Foreign key con tabla productos
*/

-- Crear tabla compras
CREATE TABLE IF NOT EXISTS compras (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    total numeric(10,2) GENERATED ALWAYS AS (cantidad::numeric * precio_unitario) STORED,
    proveedor text,
    fecha timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas text
);

-- Habilitar RLS
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

-- Política para acceso público
CREATE POLICY "Compras públicas"
    ON compras
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_compras_producto_id ON compras(producto_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor);