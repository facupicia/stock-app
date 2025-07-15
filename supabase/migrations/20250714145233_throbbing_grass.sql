/*
  # Crear tabla de ventas

  1. Nueva Tabla
    - `ventas`
      - `id` (uuid, primary key)
      - `producto_id` (uuid, foreign key a productos)
      - `cantidad` (integer, cantidad vendida)
      - `precio_unitario` (numeric, precio al momento de la venta)
      - `total` (numeric, calculado automáticamente)
      - `metodo_pago` (text, efectivo, tarjeta, transferencia, etc.)
      - `comision_porcentaje` (numeric, comisión de la plataforma)
      - `ganancia_neta` (numeric, ganancia después de comisiones)
      - `fecha` (timestamp, fecha de la venta)
      - `notas` (text, notas adicionales)

  2. Seguridad
    - Habilitar RLS en tabla `ventas`
    - Agregar política para acceso público

  3. Relaciones
    - Foreign key con tabla productos
    - Cascade delete si se elimina el producto
*/

-- Crear tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    total numeric(10,2) GENERATED ALWAYS AS (cantidad::numeric * precio_unitario) STORED,
    metodo_pago text NOT NULL,
    comision_porcentaje numeric(5,2) DEFAULT 0,
    ganancia_neta numeric(10,2),
    fecha timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    notas text
);

-- Habilitar RLS
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Política para acceso público
CREATE POLICY "Ventas públicas"
    ON ventas
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_producto_id ON ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_metodo_pago ON ventas(metodo_pago);