
CREATE TABLE public.admin_cm_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cm_user_id UUID NOT NULL,
  lawyer_user_id UUID NOT NULL,
  law_firm_id UUID REFERENCES public.law_firms(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_cm_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all appointments"
  ON public.admin_cm_appointments FOR SELECT
  USING (has_simple_role(auth.uid(), 'admin'));

CREATE POLICY "CM can view own appointments"
  ON public.admin_cm_appointments FOR SELECT
  USING (auth.uid() = cm_user_id);

CREATE POLICY "Lawyer can view own appointments"
  ON public.admin_cm_appointments FOR SELECT
  USING (auth.uid() = lawyer_user_id);

CREATE POLICY "CM can insert own appointments"
  ON public.admin_cm_appointments FOR INSERT
  WITH CHECK (auth.uid() = cm_user_id);

CREATE POLICY "CM can update own appointments"
  ON public.admin_cm_appointments FOR UPDATE
  USING (auth.uid() = cm_user_id);

CREATE INDEX idx_admin_cm_appointments_scheduled ON public.admin_cm_appointments(scheduled_at);
CREATE INDEX idx_admin_cm_appointments_cm ON public.admin_cm_appointments(cm_user_id);
CREATE INDEX idx_admin_cm_appointments_status ON public.admin_cm_appointments(status);
