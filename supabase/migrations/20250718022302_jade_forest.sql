/*
  # Corrección completa de la base de datos

  1. Funciones auxiliares
    - Función para verificar si un usuario es admin
    - Función para obtener el UID del usuario actual
    - Función para crear perfiles de usuario automáticamente
    - Función para actualizar timestamps

  2. Tablas principales
    - `user_profiles` - Perfiles de usuario con roles
    - `sellers` - Información de sellers
    - `seller_links` - Links de catálogos de sellers

  3. Seguridad (RLS)
    - Políticas para cada tabla según roles
    - Acceso controlado por tipo de usuario

  4. Triggers
    - Creación automática de perfiles
    - Actualización de timestamps
*/

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para obtener el UID del usuario actual
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de sellers
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de links de sellers
CREATE TABLE IF NOT EXISTS seller_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name);
CREATE INDEX IF NOT EXISTS idx_sellers_specialty ON sellers(specialty);
CREATE INDEX IF NOT EXISTS idx_seller_links_seller_id ON seller_links(seller_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_links ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para sellers
DROP POLICY IF EXISTS "Anyone can read sellers" ON sellers;
DROP POLICY IF EXISTS "Only admins can insert sellers" ON sellers;
DROP POLICY IF EXISTS "Only admins can update sellers" ON sellers;
DROP POLICY IF EXISTS "Only admins can delete sellers" ON sellers;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON sellers;
DROP POLICY IF EXISTS "Public insert allowed" ON sellers;

CREATE POLICY "Anyone can read sellers"
  ON sellers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert sellers"
  ON sellers
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update sellers"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete sellers"
  ON sellers
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Políticas para seller_links
DROP POLICY IF EXISTS "Anyone can read seller_links" ON seller_links;
DROP POLICY IF EXISTS "Only admins can insert seller_links" ON seller_links;
DROP POLICY IF EXISTS "Only admins can update seller_links" ON seller_links;
DROP POLICY IF EXISTS "Only admins can delete seller_links" ON seller_links;

CREATE POLICY "Anyone can read seller_links"
  ON seller_links
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert seller_links"
  ON seller_links
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update seller_links"
  ON seller_links
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete seller_links"
  ON seller_links
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_sellers_updated_at ON sellers;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Insertar un usuario admin por defecto (opcional)
-- Descomenta las siguientes líneas si quieres crear un admin por defecto
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'admin@example.com',
--   crypt('admin123', gen_salt('bf')),
--   now(),
--   now(),
--   now()
-- ) ON CONFLICT (email) DO NOTHING;

-- Datos de ejemplo para sellers (opcional)
INSERT INTO sellers (name, specialty, description) VALUES
  ('RepsMaster', 'Zapatillas', 'Especialista en zapatillas Jordan y Nike de alta calidad'),
  ('TopClothes', 'Remeras', 'Remeras de marcas premium con excelente calidad'),
  ('JeansKing', 'Jeans', 'Jeans de todas las marcas y talles')
ON CONFLICT DO NOTHING;

-- Links de ejemplo (opcional)
DO $$
DECLARE
    seller_id_1 uuid;
    seller_id_2 uuid;
    seller_id_3 uuid;
BEGIN
    -- Obtener IDs de sellers
    SELECT id INTO seller_id_1 FROM sellers WHERE name = 'RepsMaster' LIMIT 1;
    SELECT id INTO seller_id_2 FROM sellers WHERE name = 'TopClothes' LIMIT 1;
    SELECT id INTO seller_id_3 FROM sellers WHERE name = 'JeansKing' LIMIT 1;
    
    -- Insertar links si los sellers existen
    IF seller_id_1 IS NOT NULL THEN
        INSERT INTO seller_links (seller_id, name, url) VALUES
        (seller_id_1, 'Catálogo Jordan', 'https://repsmaster.x.yupoo.com/albums/jordan'),
        (seller_id_1, 'Catálogo Nike', 'https://repsmaster.x.yupoo.com/albums/nike')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF seller_id_2 IS NOT NULL THEN
        INSERT INTO seller_links (seller_id, name, url) VALUES
        (seller_id_2, 'Remeras Premium', 'https://topclothes.x.yupoo.com/albums/shirts')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF seller_id_3 IS NOT NULL THEN
        INSERT INTO seller_links (seller_id, name, url) VALUES
        (seller_id_3, 'Jeans Collection', 'https://jeansking.x.yupoo.com/albums/jeans')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;