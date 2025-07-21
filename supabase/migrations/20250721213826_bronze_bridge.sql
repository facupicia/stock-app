/*
  # Fix User Signup Database Error

  1. Database Functions
    - Create or replace auth.uid() function
    - Create or replace is_admin() function
    - Create trigger function for user profiles

  2. Tables
    - Ensure user_profiles table exists with correct structure
    - Add proper constraints and indexes

  3. Security Policies
    - Fix RLS policies to allow user registration
    - Ensure proper permissions for profile creation

  4. Triggers
    - Add trigger to automatically create user profiles on signup
*/

-- Ensure auth.uid() function exists
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.user_profiles;

-- Create new RLS policies
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Could not create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure sellers table exists (referenced in the app)
CREATE TABLE IF NOT EXISTS public.sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sellers RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read sellers" ON public.sellers;
DROP POLICY IF EXISTS "Only admins can insert sellers" ON public.sellers;
DROP POLICY IF EXISTS "Only admins can update sellers" ON public.sellers;
DROP POLICY IF EXISTS "Only admins can delete sellers" ON public.sellers;

CREATE POLICY "Anyone can read sellers"
  ON public.sellers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert sellers"
  ON public.sellers
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update sellers"
  ON public.sellers
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete sellers"
  ON public.sellers
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Ensure seller_links table exists
CREATE TABLE IF NOT EXISTS public.seller_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seller links RLS
ALTER TABLE public.seller_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read seller_links" ON public.seller_links;
DROP POLICY IF EXISTS "Only admins can insert seller_links" ON public.seller_links;
DROP POLICY IF EXISTS "Only admins can update seller_links" ON public.seller_links;
DROP POLICY IF EXISTS "Only admins can delete seller_links" ON public.seller_links;

CREATE POLICY "Anyone can read seller_links"
  ON public.seller_links
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert seller_links"
  ON public.seller_links
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update seller_links"
  ON public.seller_links
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete seller_links"
  ON public.seller_links
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sellers_name ON public.sellers(name);
CREATE INDEX IF NOT EXISTS idx_sellers_specialty ON public.sellers(specialty);
CREATE INDEX IF NOT EXISTS idx_seller_links_seller_id ON public.seller_links(seller_id);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();