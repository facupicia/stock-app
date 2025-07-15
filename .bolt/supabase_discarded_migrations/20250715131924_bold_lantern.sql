/*
  # Create productos table

  1. New Tables
    - `productos`
      - `id` (uuid, primary key)
      - `codigo` (text, unique, auto-generated)
      - `nombre` (text)
      - `categoria` (text)
      - `talle` (text)
      - `color` (text)
      - `stock` (integer, default 0)
      - `precio_costo` (numeric)
      - `precio_venta` (numeric)
      - `margen_porcentaje` (numeric, calculated)
      - `stock_minimo` (integer, default 2)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `productos` table
    - Add policy for public access (adjust as needed)

  3. Functions
    - Auto-generate product codes
    - Auto-update timestamps
*/

-- Create productos table
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
    ((precio_venta - precio_costo) / precio_costo) * 100
  ) STORED,
  stock_minimo integer DEFAULT 2,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed for your security requirements)
CREATE POLICY "Productos públicos"
  ON productos
  FOR ALL
  TO public
  USING (true);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate product codes
CREATE OR REPLACE FUNCTION generate_producto_codigo()
RETURNS TRIGGER AS $$
DECLARE
  prefix text;
  counter integer;
  new_codigo text;
BEGIN
  -- Generate prefix from category (first 3 letters, uppercase)
  prefix := upper(left(NEW.categoria, 3));
  
  -- Get next counter for this prefix
  SELECT COALESCE(MAX(CAST(substring(codigo FROM '[0-9]+$') AS integer)), 0) + 1
  INTO counter
  FROM productos
  WHERE codigo ~ ('^' || prefix || '[0-9]+$');
  
  -- Generate new code
  new_codigo := prefix || lpad(counter::text, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM productos WHERE codigo = new_codigo) LOOP
    counter := counter + 1;
    new_codigo := prefix || lpad(counter::text, 4, '0');
  END LOOP;
  
  NEW.codigo := new_codigo;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_producto_codigo_trigger
  BEFORE INSERT ON productos
  FOR EACH ROW
  WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
  EXECUTE FUNCTION generate_producto_codigo();