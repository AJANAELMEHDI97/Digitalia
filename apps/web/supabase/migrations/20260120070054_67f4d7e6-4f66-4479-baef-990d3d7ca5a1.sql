-- Ajouter la source (chat ou email) et la date de clôture aux conversations
ALTER TABLE public.support_conversations 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat' CHECK (source IN ('chat', 'email'));

ALTER TABLE public.support_conversations 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;