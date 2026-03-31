
ALTER TABLE public.admin_internal_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'en_cours',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linked_firm_id uuid NULL;
