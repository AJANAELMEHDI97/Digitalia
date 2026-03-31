-- ============================================================
-- PHASE 1: NOUVEAU SYSTÈME DE RÔLES RBAC POUR SOCIALPULSE
-- ============================================================

-- 1. Créer le nouveau type enum avec les 9 rôles
CREATE TYPE public.sp_role AS ENUM (
  'super_admin',      -- Administrateur global
  'finance',          -- Administration Finance/Comptabilité
  'ops_admin',        -- Administrateur opérationnel
  'commercial',       -- Commercial/Vente/Onboarding
  'community_manager',-- Community Manager
  'lawyer',           -- Avocat (Client)
  'lawyer_assistant', -- Assistant avocat/Collaborateur
  'support',          -- Support/Customer Success
  'demo_observer'     -- Mode démonstration/Observateur
);

-- 2. Créer la table des cabinets d'avocats
CREATE TABLE public.law_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  logo_url TEXT,
  bar_association TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Créer la table des membres de cabinets (relation user <-> cabinet)
CREATE TABLE public.law_firm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  law_firm_id UUID NOT NULL REFERENCES public.law_firms(id) ON DELETE CASCADE,
  role sp_role NOT NULL DEFAULT 'lawyer',
  is_primary BOOLEAN DEFAULT false,  -- Pour identifier le contact principal
  can_validate BOOLEAN DEFAULT false, -- Droit de valider les contenus (avocat uniquement)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, law_firm_id)
);

-- 4. Créer la table des affectations CM <-> Avocats
CREATE TABLE public.cm_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cm_user_id UUID NOT NULL,           -- L'utilisateur CM
  lawyer_user_id UUID NOT NULL,       -- L'avocat assigné
  law_firm_id UUID REFERENCES public.law_firms(id) ON DELETE CASCADE,
  assigned_by UUID,                    -- Qui a fait l'affectation
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cm_user_id, lawyer_user_id)
);

-- 5. Créer la nouvelle table de rôles avec sp_role
CREATE TABLE public.user_roles_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role sp_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 6. Ajouter law_firm_id à la table publications pour lier au cabinet
ALTER TABLE public.publications ADD COLUMN IF NOT EXISTS law_firm_id UUID REFERENCES public.law_firms(id);

-- 7. Ajouter law_firm_id à la table invoices pour facturation par cabinet
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS law_firm_id UUID REFERENCES public.law_firms(id);

-- ============================================================
-- FONCTIONS HELPER POUR LE NOUVEAU SYSTÈME RBAC
-- ============================================================

-- Fonction pour vérifier si un utilisateur a un rôle spécifique (v2)
CREATE OR REPLACE FUNCTION public.has_sp_role(_user_id UUID, _role sp_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles_v2
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fonction pour vérifier si l'utilisateur est un admin (super_admin, ops_admin ou finance)
CREATE OR REPLACE FUNCTION public.is_internal_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles_v2
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'ops_admin', 'finance')
  )
$$;

-- Fonction pour vérifier si l'utilisateur est super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles_v2
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Fonction pour vérifier si un CM est affecté à un avocat
CREATE OR REPLACE FUNCTION public.cm_has_access_to_lawyer(_cm_user_id UUID, _lawyer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cm_assignments
    WHERE cm_user_id = _cm_user_id 
    AND lawyer_user_id = _lawyer_user_id
    AND is_active = true
  )
$$;

-- Fonction pour obtenir les IDs des cabinets d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_law_firms(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT law_firm_id FROM public.law_firm_members
  WHERE user_id = _user_id
$$;

-- Fonction pour vérifier si un utilisateur appartient à un cabinet
CREATE OR REPLACE FUNCTION public.user_belongs_to_firm(_user_id UUID, _law_firm_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.law_firm_members
    WHERE user_id = _user_id AND law_firm_id = _law_firm_id
  )
$$;

-- ============================================================
-- MIGRATION DES RÔLES EXISTANTS
-- ============================================================

-- Migrer admin -> super_admin
INSERT INTO public.user_roles_v2 (user_id, role)
SELECT user_id, 'super_admin'::sp_role
FROM public.user_roles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrer moderator -> ops_admin
INSERT INTO public.user_roles_v2 (user_id, role)
SELECT user_id, 'ops_admin'::sp_role
FROM public.user_roles
WHERE role = 'moderator'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrer user -> lawyer
INSERT INTO public.user_roles_v2 (user_id, role)
SELECT user_id, 'lawyer'::sp_role
FROM public.user_roles
WHERE role = 'user'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- ACTIVATION RLS ET POLITIQUES
-- ============================================================

-- law_firms
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin et ops_admin peuvent tout voir sur law_firms"
ON public.law_firms FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_sp_role(auth.uid(), 'ops_admin')
);

CREATE POLICY "Membres peuvent voir leur cabinet"
ON public.law_firms FOR SELECT
USING (
  id IN (SELECT public.get_user_law_firms(auth.uid()))
);

CREATE POLICY "Super admin peut créer des cabinets"
ON public.law_firms FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Commercial peut créer des cabinets (onboarding)"
ON public.law_firms FOR INSERT
WITH CHECK (public.has_sp_role(auth.uid(), 'commercial'));

CREATE POLICY "Super admin et ops_admin peuvent modifier les cabinets"
ON public.law_firms FOR UPDATE
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_sp_role(auth.uid(), 'ops_admin')
);

CREATE POLICY "Super admin peut supprimer des cabinets"
ON public.law_firms FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- law_firm_members
ALTER TABLE public.law_firm_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir tous les membres"
ON public.law_firm_members FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_sp_role(auth.uid(), 'ops_admin')
);

CREATE POLICY "Membres peuvent voir les membres de leur cabinet"
ON public.law_firm_members FOR SELECT
USING (
  law_firm_id IN (SELECT public.get_user_law_firms(auth.uid()))
);

CREATE POLICY "Super admin peut gérer les membres"
ON public.law_firm_members FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Commercial peut ajouter des membres (onboarding)"
ON public.law_firm_members FOR INSERT
WITH CHECK (public.has_sp_role(auth.uid(), 'commercial'));

-- cm_assignments
ALTER TABLE public.cm_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin et ops_admin peuvent voir toutes les affectations"
ON public.cm_assignments FOR SELECT
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_sp_role(auth.uid(), 'ops_admin')
);

CREATE POLICY "CM peut voir ses propres affectations"
ON public.cm_assignments FOR SELECT
USING (cm_user_id = auth.uid());

CREATE POLICY "Avocat peut voir qui lui est affecté"
ON public.cm_assignments FOR SELECT
USING (lawyer_user_id = auth.uid());

CREATE POLICY "Super admin et ops_admin peuvent gérer les affectations"
ON public.cm_assignments FOR ALL
USING (
  public.is_super_admin(auth.uid()) OR 
  public.has_sp_role(auth.uid(), 'ops_admin')
);

CREATE POLICY "Commercial peut créer des affectations"
ON public.cm_assignments FOR INSERT
WITH CHECK (public.has_sp_role(auth.uid(), 'commercial'));

-- user_roles_v2
ALTER TABLE public.user_roles_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin peut tout sur les rôles"
ON public.user_roles_v2 FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Utilisateurs peuvent voir leurs propres rôles v2"
ON public.user_roles_v2 FOR SELECT
USING (user_id = auth.uid());

-- ============================================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================================

CREATE TRIGGER update_law_firms_updated_at
  BEFORE UPDATE ON public.law_firms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_law_firm_members_updated_at
  BEFORE UPDATE ON public.law_firm_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cm_assignments_updated_at
  BEFORE UPDATE ON public.cm_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ACTIVER REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.law_firms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.law_firm_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cm_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles_v2;