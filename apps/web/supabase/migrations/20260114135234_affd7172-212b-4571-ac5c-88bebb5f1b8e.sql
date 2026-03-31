-- Create enum for publication source
CREATE TYPE public.publication_source AS ENUM ('manual', 'socialpulse');

-- Add source column to publications table
ALTER TABLE public.publications 
ADD COLUMN source public.publication_source NOT NULL DEFAULT 'manual';