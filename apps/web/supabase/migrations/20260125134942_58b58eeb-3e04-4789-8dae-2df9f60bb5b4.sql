-- =========================================
-- FONCTION CONSOLIDÉE : get_user_session_data
-- Récupère toutes les données utilisateur en une seule requête
-- =========================================

CREATE OR REPLACE FUNCTION public.get_user_session_data(_user_id uuid)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p.*)
      FROM profiles p
      WHERE p.user_id = _user_id
    ),
    'roles', (
      SELECT COALESCE(array_agg(r.role), ARRAY[]::sp_role[])
      FROM user_roles_v2 r
      WHERE r.user_id = _user_id
    ),
    'firms', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'law_firm_id', lfm.law_firm_id,
          'role', lfm.role,
          'is_primary', lfm.is_primary,
          'can_validate', lfm.can_validate,
          'law_firms', row_to_json(lf.*)
        )
      ), '[]'::json)
      FROM law_firm_members lfm
      JOIN law_firms lf ON lfm.law_firm_id = lf.id
      WHERE lfm.user_id = _user_id
    ),
    'cm_assignments', (
      SELECT COALESCE(json_agg(row_to_json(ca.*)), '[]'::json)
      FROM cm_assignments ca
      WHERE (ca.cm_user_id = _user_id OR ca.lawyer_user_id = _user_id)
      AND ca.is_active = true
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_session_data(uuid) TO authenticated;

-- =========================================
-- INDEX DE PERFORMANCE
-- =========================================

-- Index sur publications
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_law_firm_id ON publications(law_firm_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_scheduled_date ON publications(scheduled_date);

-- Index sur publication_metrics
CREATE INDEX IF NOT EXISTS idx_publication_metrics_publication_id ON publication_metrics(publication_id);

-- Index sur law_firm_members
CREATE INDEX IF NOT EXISTS idx_law_firm_members_user_id ON law_firm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_law_firm_members_law_firm_id ON law_firm_members(law_firm_id);

-- Index sur cm_assignments
CREATE INDEX IF NOT EXISTS idx_cm_assignments_cm_user_id ON cm_assignments(cm_user_id);
CREATE INDEX IF NOT EXISTS idx_cm_assignments_lawyer_user_id ON cm_assignments(lawyer_user_id);

-- Index sur profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Index sur user_roles_v2
CREATE INDEX IF NOT EXISTS idx_user_roles_v2_user_id ON user_roles_v2(user_id);