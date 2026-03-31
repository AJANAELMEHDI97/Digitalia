-- Add published_at column to track actual publication date
ALTER TABLE public.publications 
ADD COLUMN published_at timestamp with time zone DEFAULT NULL;