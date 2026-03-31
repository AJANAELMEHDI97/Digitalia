-- Add new columns to scraping_jobs for AI search
ALTER TABLE public.scraping_jobs
ADD COLUMN IF NOT EXISTS search_query TEXT,
ADD COLUMN IF NOT EXISTS search_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS urls_found INTEGER DEFAULT 0;