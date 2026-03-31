-- Add new columns to email_recipients if they don't exist
ALTER TABLE public.email_recipients
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

-- Add new columns to email_campaigns for enhanced statistics
ALTER TABLE public.email_campaigns
ADD COLUMN IF NOT EXISTS bounce_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribe_count integer NOT NULL DEFAULT 0;