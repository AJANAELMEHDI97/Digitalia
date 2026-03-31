-- Ajouter les colonnes de configuration éditoriale à la table law_firms
ALTER TABLE law_firms 
ADD COLUMN IF NOT EXISTS specialization_areas text[] DEFAULT '{}';

ALTER TABLE law_firms 
ADD COLUMN IF NOT EXISTS social_networks text[] DEFAULT ARRAY['linkedin'];

ALTER TABLE law_firms 
ADD COLUMN IF NOT EXISTS editorial_tone text DEFAULT 'professional';

ALTER TABLE law_firms 
ADD COLUMN IF NOT EXISTS publication_frequency text DEFAULT '3_per_week';

-- Commentaires pour documentation
COMMENT ON COLUMN law_firms.specialization_areas IS 'Domaines de droit du cabinet';
COMMENT ON COLUMN law_firms.social_networks IS 'Réseaux sociaux utilisés';
COMMENT ON COLUMN law_firms.editorial_tone IS 'Ton éditorial préféré';
COMMENT ON COLUMN law_firms.publication_frequency IS 'Fréquence de publication souhaitée';