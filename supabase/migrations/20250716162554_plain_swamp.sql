/*
  # Crear tabla de sellers

  1. Nueva Tabla
    - `sellers`
      - `id` (uuid, primary key)
      - `name` (text, nombre del seller)
      - `specialty` (text, especialidad del seller)
      - `description` (text, descripción opcional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Nueva Tabla
    - `seller_links`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, foreign key)
      - `name` (text, nombre del link)
      - `url` (text, URL del catálogo)
      - `created_at` (timestamp)

  3. Seguridad
    - Enable RLS en ambas tablas
    - Políticas para usuarios autenticados
*/

-- Crear tabla de sellers
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de links de catálogos
CREATE TABLE IF NOT EXISTS seller_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_links ENABLE ROW LEVEL SECURITY;

-- Políticas para sellers
CREATE POLICY "Permitir lectura pública de sellers"
  ON sellers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON sellers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación a usuarios autenticados"
  ON sellers
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para seller_links
CREATE POLICY "Permitir lectura pública de seller_links"
  ON seller_links
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados"
  ON seller_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados"
  ON seller_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminación a usuarios autenticados"
  ON seller_links
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_sellers_specialty ON sellers(specialty);
CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name);
CREATE INDEX IF NOT EXISTS idx_seller_links_seller_id ON seller_links(seller_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();