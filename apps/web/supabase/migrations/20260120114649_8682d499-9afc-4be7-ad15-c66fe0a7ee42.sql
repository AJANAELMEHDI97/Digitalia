-- Add 'refuse' status to publication_status enum
ALTER TYPE public.publication_status ADD VALUE IF NOT EXISTS 'refuse';

-- Add rejection tracking columns to publications
ALTER TABLE public.publications
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;