-- Ajouter le rôle lawyer à votre compte (user_roles_v2)
INSERT INTO user_roles_v2 (user_id, role)
VALUES ('6fe9e0f1-caec-45cf-a419-3d7c8d98a033', 'lawyer')
ON CONFLICT (user_id, role) DO NOTHING;

-- Créer un cabinet de test si nécessaire
INSERT INTO law_firms (name, subscription_plan, is_active)
VALUES ('Cabinet Test Amine', 'avance', true)
ON CONFLICT DO NOTHING;

-- Associer votre compte au cabinet avec le rôle lawyer (pas owner)
INSERT INTO law_firm_members (user_id, law_firm_id, role, is_primary, can_validate)
SELECT 
  '6fe9e0f1-caec-45cf-a419-3d7c8d98a033',
  id,
  'lawyer',
  true,
  true
FROM law_firms 
WHERE name = 'Cabinet Test Amine'
ON CONFLICT DO NOTHING;