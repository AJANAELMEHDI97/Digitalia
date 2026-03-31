-- Add new fields to profiles for complete lawyer profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS bar_association text,
ADD COLUMN IF NOT EXISTS bio text;