-- Add new columns for request qualification and extended status
ALTER TABLE public.support_conversations 
ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'general_question',
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS expected_action TEXT DEFAULT 'information',
ADD COLUMN IF NOT EXISTS lawyer_name TEXT,
ADD COLUMN IF NOT EXISTS law_firm_name TEXT,
ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Update status column to support more states
-- First, update existing values to new enum values
UPDATE public.support_conversations 
SET status = 'en_attente' WHERE status = 'pending';

UPDATE public.support_conversations 
SET status = 'en_cours' WHERE status = 'open';

UPDATE public.support_conversations 
SET status = 'archive' WHERE status = 'closed';

-- Create support_activity_logs table for traceability
CREATE TABLE IF NOT EXISTS public.support_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity logs
ALTER TABLE public.support_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.support_activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
ON public.support_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add ai_usage column to support_messages for tracking AI assistance
ALTER TABLE public.support_messages
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_suggested_actions JSONB;