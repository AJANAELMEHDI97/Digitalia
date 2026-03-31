-- Create publication_comments table
CREATE TABLE public.publication_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access comments on their own publications
CREATE POLICY "Users can view comments on their publications"
ON public.publication_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.publications 
    WHERE publications.id = publication_comments.publication_id 
    AND publications.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments on their publications"
ON public.publication_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.publications 
    WHERE publications.id = publication_comments.publication_id 
    AND publications.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.publication_comments FOR DELETE
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_publication_comments_publication_id 
ON public.publication_comments(publication_id);