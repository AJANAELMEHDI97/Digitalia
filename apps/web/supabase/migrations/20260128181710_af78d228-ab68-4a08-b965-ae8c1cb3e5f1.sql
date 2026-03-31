-- ============================================
-- VALIDATION SLA WORKFLOW ENHANCEMENT
-- ============================================

-- 1. Create extended validation status enum
CREATE TYPE validation_extended_status AS ENUM (
  'draft',
  'cm_review',
  'submitted_to_lawyer',
  'in_lawyer_review',
  'validated',
  'refused',
  'modified_by_lawyer',
  'expired',
  'published'
);

-- 2. Create urgency level enum
CREATE TYPE urgency_level AS ENUM (
  'normal',
  'urgent'
);

-- 3. Create expiration behavior enum
CREATE TYPE expiration_behavior AS ENUM (
  'do_not_publish',
  'save_as_draft',
  'auto_publish'
);

-- 4. Add new columns to publications table for SLA tracking
ALTER TABLE publications 
ADD COLUMN IF NOT EXISTS validation_status validation_extended_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS urgency urgency_level DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS modification_request_comment TEXT,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- 5. Add expiration behavior preference to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS validation_sla_hours INTEGER DEFAULT 48,
ADD COLUMN IF NOT EXISTS urgent_sla_hours INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS expiration_behavior expiration_behavior DEFAULT 'do_not_publish';

-- 6. Create validation audit trail table
CREATE TABLE IF NOT EXISTS validation_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  comment TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Enable RLS on audit trail
ALTER TABLE validation_audit_trail ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for audit trail
CREATE POLICY "Users can view audit trail for their publications"
ON validation_audit_trail
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM publications p
    WHERE p.id = validation_audit_trail.publication_id
    AND (
      p.user_id = auth.uid()
      OR cm_can_access_publication(auth.uid(), p.user_id)
      OR is_super_admin(auth.uid())
      OR has_sp_role(auth.uid(), 'ops_admin'::sp_role)
    )
  )
);

CREATE POLICY "Users can insert audit entries for accessible publications"
ON validation_audit_trail
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM publications p
    WHERE p.id = validation_audit_trail.publication_id
    AND (
      p.user_id = auth.uid()
      OR cm_can_access_publication(auth.uid(), p.user_id)
      OR is_super_admin(auth.uid())
    )
  )
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_publications_validation_status ON publications(validation_status);
CREATE INDEX IF NOT EXISTS idx_publications_expires_at ON publications(expires_at);
CREATE INDEX IF NOT EXISTS idx_publications_urgency ON publications(urgency);
CREATE INDEX IF NOT EXISTS idx_validation_audit_publication ON validation_audit_trail(publication_id);
CREATE INDEX IF NOT EXISTS idx_validation_audit_created ON validation_audit_trail(created_at DESC);

-- 10. Create function to calculate expiration time
CREATE OR REPLACE FUNCTION calculate_expiration_time(
  p_submitted_at TIMESTAMP WITH TIME ZONE,
  p_sla_hours INTEGER
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT p_submitted_at + (p_sla_hours || ' hours')::INTERVAL
$$;