-- Create enum for social platforms
CREATE TYPE public.social_platform AS ENUM ('linkedin', 'instagram', 'facebook', 'twitter');

-- Add platform and parent_id columns to publications
ALTER TABLE public.publications 
ADD COLUMN platform public.social_platform,
ADD COLUMN parent_id UUID REFERENCES public.publications(id) ON DELETE SET NULL;

-- Create index for better performance on parent_id queries
CREATE INDEX idx_publications_parent_id ON public.publications(parent_id);

-- Create index for platform queries
CREATE INDEX idx_publications_platform ON public.publications(platform);