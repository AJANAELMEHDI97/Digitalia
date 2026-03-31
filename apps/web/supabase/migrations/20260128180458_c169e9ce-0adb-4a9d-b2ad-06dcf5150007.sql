-- Create the connection_status enum type
CREATE TYPE connection_status AS ENUM ('not_connected', 'ready', 'active');

-- Add connection_status column to social_connections table
ALTER TABLE public.social_connections 
ADD COLUMN connection_status connection_status DEFAULT 'not_connected';