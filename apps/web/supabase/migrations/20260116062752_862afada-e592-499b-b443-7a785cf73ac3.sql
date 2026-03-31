-- Add dashboard_layout column to profiles table to store block order
ALTER TABLE public.profiles 
ADD COLUMN dashboard_layout JSONB DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.profiles.dashboard_layout IS 'Stores the user preferred order of dashboard blocks as JSON array';