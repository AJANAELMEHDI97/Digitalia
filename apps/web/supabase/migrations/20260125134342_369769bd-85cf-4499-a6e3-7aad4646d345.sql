-- Add subscription_plan column to law_firms table
ALTER TABLE public.law_firms 
ADD COLUMN subscription_plan text DEFAULT 'essentiel' 
CHECK (subscription_plan IN ('essentiel', 'avance', 'expert'));