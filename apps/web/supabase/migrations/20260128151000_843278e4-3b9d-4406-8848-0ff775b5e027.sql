-- Phase 1: Add username column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Phase 2: Create simplified role enum
CREATE TYPE public.simple_role AS ENUM (
  'admin',
  'community_manager', 
  'lawyer'
);

-- Phase 3: Create new simplified roles table
CREATE TABLE public.user_roles_simple (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role simple_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles_simple ENABLE ROW LEVEL SECURITY;

-- Phase 4: Security definer functions
CREATE OR REPLACE FUNCTION public.has_simple_role(_user_id UUID, _role simple_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles_simple
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_simple_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles_simple
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_simple_user_role(_user_id UUID)
RETURNS simple_role
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles_simple
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Phase 5: RLS Policies for user_roles_simple
CREATE POLICY "admin_full_access" ON public.user_roles_simple
FOR ALL USING (is_simple_admin(auth.uid()));

CREATE POLICY "users_view_own_role" ON public.user_roles_simple
FOR SELECT USING (user_id = auth.uid());

-- Phase 6: Update handle_new_user trigger to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, username)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;

-- Phase 7: Migrate existing roles to new table
INSERT INTO public.user_roles_simple (user_id, role)
SELECT user_id, 
  CASE 
    WHEN role = 'super_admin' THEN 'admin'::simple_role
    WHEN role = 'ops_admin' THEN 'admin'::simple_role
    WHEN role = 'community_manager' THEN 'community_manager'::simple_role
    ELSE 'lawyer'::simple_role
  END
FROM public.user_roles_v2
ON CONFLICT (user_id) DO NOTHING;