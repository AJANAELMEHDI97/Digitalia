-- Add auto_validation_delay column to profiles
-- Values: NULL = manual only (default), '24h', '48h'
ALTER TABLE public.profiles 
ADD COLUMN auto_validation_delay text DEFAULT NULL 
CHECK (auto_validation_delay IS NULL OR auto_validation_delay IN ('24h', '48h'));