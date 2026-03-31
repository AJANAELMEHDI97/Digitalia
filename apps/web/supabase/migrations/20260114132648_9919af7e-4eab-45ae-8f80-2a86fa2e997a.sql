-- Create enum for publication status
CREATE TYPE public.publication_status AS ENUM ('brouillon', 'a_valider', 'programme');

-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL DEFAULT '09:00',
  status publication_status NOT NULL DEFAULT 'brouillon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own publications"
ON public.publications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publications"
ON public.publications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publications"
ON public.publications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own publications"
ON public.publications FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();