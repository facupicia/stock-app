/*
  # Create ventas table

  1. New Tables
    - `ventas`
      - `id` (uuid, primary key)
      - `producto_id` (uuid, foreign key to productos)
      - `cantidad` (integer)
      - `precio_unitario` (numeric)
      - `total` (numeric, calculated)
      - `metodo_pago` (text)
      - `comision_porcentaje` (numeric, default 0)
      - `ganancia_neta` (numeric)
      - `fecha` (timestamp, default now)
      - `notas` (text, optional)

  2. Security
    - Enable RLS on `ventas` table
    - Add policy for public access

  3. Constraints
    - Foreign key to productos table with CASCADE delete
*/

-- Create ventas table
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

-- Enable RLS
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Ventas públicas"
  ON ventas
  FOR ALL
  TO public
  USING (true);