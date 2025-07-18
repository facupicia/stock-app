/*
  # Sistema de Autenticación y Roles de Usuario

  1. Nuevas Tablas
    - `user_profiles` - Perfiles de usuario con roles
    
  2. Roles
    - `admin` - Puede agregar, editar y eliminar sellers
    - `user` - Solo puede ver sellers (lectura)
    
  3. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas específicas por rol
    - Solo admins pueden modificar sellers
    
  4. Funciones
    - Función para crear perfil automáticamente al registrarse
    - Función para verificar si el usuario es admin
*/

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
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

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar políticas de sellers para usar roles
DROP POLICY IF EXISTS "Permitir lectura pública de sellers" ON sellers;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON sellers;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON sellers;
DROP POLICY IF EXISTS "Permitir eliminación a usuarios autenticados" ON sellers;

-- Nuevas políticas basadas en roles
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

-- Actualizar políticas de seller_links para usar roles
DROP POLICY IF EXISTS "Permitir lectura pública de seller_links" ON seller_links;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON seller_links;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON seller_links;
DROP POLICY IF EXISTS "Permitir eliminación a usuarios autenticados" ON seller_links;
DROP POLICY IF EXISTS "Allow public insert" ON seller_links;

-- Nuevas políticas para seller_links
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

-- Crear un usuario admin por defecto (opcional)
-- Nota: Esto se debe hacer después de que alguien se registre
-- INSERT INTO user_profiles (user_id, email, role) 
-- VALUES ('user-uuid-here', 'admin@example.com', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';