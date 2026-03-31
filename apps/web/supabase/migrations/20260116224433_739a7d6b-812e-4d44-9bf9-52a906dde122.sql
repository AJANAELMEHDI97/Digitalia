-- Add columns to email_templates for template categories and system templates
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS is_system_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add website_url to profiles for generating article links
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS cabinet_name TEXT;

-- Create index for faster system template queries
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_system ON public.email_templates(is_system_template);