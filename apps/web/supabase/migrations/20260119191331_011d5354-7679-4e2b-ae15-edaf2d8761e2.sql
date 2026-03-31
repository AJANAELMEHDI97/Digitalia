-- Supprimer l'ancienne contrainte unique problématique
ALTER TABLE cm_assignments 
DROP CONSTRAINT IF EXISTS cm_assignments_cm_user_id_lawyer_user_id_key;

-- Ajouter la nouvelle contrainte (un CM ne peut être assigné qu'une fois par cabinet)
ALTER TABLE cm_assignments 
ADD CONSTRAINT cm_assignments_cm_user_id_law_firm_id_key 
UNIQUE (cm_user_id, law_firm_id);

-- Nettoyer les publications orphelines (sans assignation CM valide)
DELETE FROM publications 
WHERE law_firm_id IS NOT NULL 
AND law_firm_id NOT IN (
  SELECT DISTINCT law_firm_id FROM cm_assignments WHERE law_firm_id IS NOT NULL
);

-- Nettoyer les cabinets orphelins (sans assignation CM)
DELETE FROM law_firms 
WHERE id NOT IN (
  SELECT DISTINCT law_firm_id FROM cm_assignments WHERE law_firm_id IS NOT NULL
);