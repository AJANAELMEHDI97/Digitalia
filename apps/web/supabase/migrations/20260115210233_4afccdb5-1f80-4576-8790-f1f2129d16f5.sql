-- Add 'blog' to social_platform enum
ALTER TYPE social_platform ADD VALUE IF NOT EXISTS 'blog';

-- Add title column for blog articles
ALTER TABLE publications ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN publications.title IS 'Title for blog articles (optional for social posts)';