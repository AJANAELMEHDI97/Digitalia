-- ===========================================
-- PHASE 1: Tables pour l'expérience Community Manager
-- ===========================================

-- Table des demandes de modification (workflow CM → Avocat)
CREATE TABLE public.modification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  law_firm_id UUID REFERENCES public.law_firms(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('cabinet_info', 'social_pages', 'editorial_settings', 'validation_rules')),
  field_name TEXT NOT NULL,
  current_value TEXT,
  requested_value TEXT NOT NULL,
  justification TEXT NOT NULL CHECK (length(justification) >= 20),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table d'audit des actions CM (traçabilité)
CREATE TABLE public.cm_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cm_user_id UUID NOT NULL,
  law_firm_id UUID REFERENCES public.law_firms(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'edit', 'delete', 'publish', 'schedule', 'unschedule')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('publication', 'media', 'campaign', 'modification_request')),
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX idx_modification_requests_requester ON public.modification_requests(requester_id);
CREATE INDEX idx_modification_requests_law_firm ON public.modification_requests(law_firm_id);
CREATE INDEX idx_modification_requests_status ON public.modification_requests(status);
CREATE INDEX idx_cm_activity_logs_cm_user ON public.cm_activity_logs(cm_user_id);
CREATE INDEX idx_cm_activity_logs_law_firm ON public.cm_activity_logs(law_firm_id);
CREATE INDEX idx_cm_activity_logs_created ON public.cm_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.modification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cm_activity_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS Policies pour modification_requests
-- ===========================================

-- CM peut voir ses propres demandes
CREATE POLICY "CM can view own requests"
ON public.modification_requests
FOR SELECT
USING (auth.uid() = requester_id);

-- CM peut créer des demandes pour ses cabinets assignés
CREATE POLICY "CM can create requests for assigned firms"
ON public.modification_requests
FOR INSERT
WITH CHECK (
  auth.uid() = requester_id
  AND (
    public.has_sp_role(auth.uid(), 'community_manager')
    AND EXISTS (
      SELECT 1 FROM public.cm_assignments
      WHERE cm_user_id = auth.uid()
      AND law_firm_id = modification_requests.law_firm_id
      AND is_active = true
    )
  )
);

-- Avocat/Admin peut voir les demandes de ses cabinets
CREATE POLICY "Lawyer can view firm requests"
ON public.modification_requests
FOR SELECT
USING (
  public.user_belongs_to_firm(auth.uid(), law_firm_id)
  OR public.is_super_admin(auth.uid())
);

-- Avocat/Admin peut mettre à jour (approuver/rejeter)
CREATE POLICY "Lawyer can update firm requests"
ON public.modification_requests
FOR UPDATE
USING (
  public.user_belongs_to_firm(auth.uid(), law_firm_id)
  OR public.is_super_admin(auth.uid())
);

-- ===========================================
-- RLS Policies pour cm_activity_logs
-- ===========================================

-- CM peut insérer ses propres logs
CREATE POLICY "CM can insert own logs"
ON public.cm_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = cm_user_id);

-- Super Admin peut voir tous les logs
CREATE POLICY "Super admin can view all logs"
ON public.cm_activity_logs
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- Avocat peut voir les logs de ses cabinets
CREATE POLICY "Lawyer can view firm logs"
ON public.cm_activity_logs
FOR SELECT
USING (public.user_belongs_to_firm(auth.uid(), law_firm_id));

-- ===========================================
-- Trigger pour updated_at
-- ===========================================

CREATE TRIGGER update_modification_requests_updated_at
BEFORE UPDATE ON public.modification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- DONNÉES DE DÉMONSTRATION
-- ===========================================

-- Insérer 3 cabinets de test
INSERT INTO public.law_firms (id, name, city, bar_association, email, phone, address, postal_code, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Cabinet Durand & Associés', 'Paris', 'Barreau de Paris', 'contact@durand-avocats.fr', '01 42 00 00 01', '15 rue du Faubourg Saint-Honoré', '75008', true),
  ('22222222-2222-2222-2222-222222222222', 'Maître Sophie Martin', 'Lyon', 'Barreau de Lyon', 'sophie.martin@avocat-lyon.fr', '04 72 00 00 02', '8 place Bellecour', '69002', true),
  ('33333333-3333-3333-3333-333333333333', 'Cabinet Lefebvre Droit des Affaires', 'Bordeaux', 'Barreau de Bordeaux', 'cabinet@lefebvre-bordeaux.fr', '05 56 00 00 03', '22 cours de l''Intendance', '33000', true);