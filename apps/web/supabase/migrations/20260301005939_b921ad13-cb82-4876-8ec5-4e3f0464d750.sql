
CREATE TABLE public.admin_internal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  thread_id uuid,
  context_type text,
  context_id uuid,
  context_label text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_internal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_messages_select" ON public.admin_internal_messages
  FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()) OR auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "admin_messages_insert" ON public.admin_internal_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "admin_messages_update" ON public.admin_internal_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id OR is_super_admin(auth.uid()));

CREATE POLICY "admin_messages_delete" ON public.admin_internal_messages
  FOR DELETE TO authenticated
  USING (is_super_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_internal_messages;
