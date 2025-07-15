/*
  # Create compras table

  1. New Tables
    - `compras`
      - `id` (uuid, primary key)
      - `producto_id` (uuid, foreign key to productos)
      - `cantidad` (integer)
      - `precio_unitario` (numeric)
      - `total` (numeric, calculated)
      - `proveedor` (text, optional)
      - `fecha` (timestamp, default now)
      - `notas` (text, optional)

  2. Security
    - Enable RLS on `compras` table
    - Add policy for public access

  3. Constraints
    - Foreign key to productos table with CASCADE delete
*/

-- Create compras table
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

-- Enable RLS
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Compras públicas"
  ON compras
  FOR ALL
  TO public
  USING (true);