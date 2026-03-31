import { pool } from "../db/pool.js";
export const ensureApplicationSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS law_firm_id TEXT
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS parent_id UUID
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'routine'
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS modification_request_comment TEXT
    `);
        await client.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS target_connections JSONB NOT NULL DEFAULT '[]'::jsonb
    `);
        await client.query(`
      ALTER TABLE posts
      DROP CONSTRAINT IF EXISTS posts_source_check
    `);
        await client.query(`
      ALTER TABLE posts
      ADD CONSTRAINT posts_source_check
      CHECK (source IN ('manual', 'socialpulse'))
    `);
        await client.query(`
      ALTER TABLE posts
      DROP CONSTRAINT IF EXISTS posts_priority_check
    `);
        await client.query(`
      ALTER TABLE posts
      ADD CONSTRAINT posts_priority_check
      CHECK (priority IN ('routine', 'important', 'strategique'))
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS social_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
        provider TEXT NOT NULL CHECK (provider IN ('linkedin', 'facebook', 'instagram', 'youtube')),
        account_id TEXT NOT NULL,
        account_name TEXT NOT NULL,
        account_handle TEXT NOT NULL DEFAULT '',
        account_type TEXT NOT NULL DEFAULT 'profile',
        avatar_url TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TIMESTAMPTZ,
        scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked', 'attention')) DEFAULT 'active',
        last_sync_at TIMESTAMPTZ,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (organization_id, provider, account_id)
      )
    `);
        await client.query(`
      CREATE TABLE IF NOT EXISTS post_publications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        social_connection_id UUID REFERENCES social_connections(id) ON DELETE SET NULL,
        provider TEXT NOT NULL CHECK (provider IN ('linkedin', 'facebook', 'instagram', 'youtube')),
        status TEXT NOT NULL CHECK (status IN ('queued', 'published', 'failed', 'skipped')) DEFAULT 'queued',
        external_post_id TEXT,
        published_url TEXT,
        error_message TEXT,
        response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await client.query(`
      ALTER TABLE post_publications
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
    `);
        await client.query(`
      ALTER TABLE post_publications
      ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
    `);
        await client.query(`
      ALTER TABLE post_publications
      ADD COLUMN IF NOT EXISTS deletion_error_message TEXT
    `);
        await client.query(`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    `);
        await client.query(`
      ALTER TABLE post_publications
      DROP CONSTRAINT IF EXISTS post_publications_status_check
    `);
        await client.query(`
      ALTER TABLE post_publications
      ADD CONSTRAINT post_publications_status_check
      CHECK (status IN ('queued', 'published', 'failed', 'skipped', 'deleted', 'delete_failed'))
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_social_connections_org_provider
      ON social_connections (organization_id, provider, status)
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_publications_post
      ON post_publications (post_id, provider, created_at DESC)
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_org_firm_status
      ON posts (organization_id, law_firm_id, status)
    `);
        await client.query(`
      INSERT INTO integrations (organization_id, name, kind, status, sync_frequency, details, last_sync_at)
      SELECT
        organizations.id,
        provider_rows.name,
        'social',
        'draft',
        'OAuth + sync manuelle',
        provider_rows.details::jsonb,
        NULL
      FROM organizations
      CROSS JOIN (
        VALUES
          ('LinkedIn', '{"provider":"linkedin","realNetwork":true,"capabilities":["connect","publish_text"]}'),
          ('Facebook Pages', '{"provider":"facebook","realNetwork":true,"capabilities":["connect","publish_text","publish_image"]}'),
          ('Instagram Business', '{"provider":"instagram","realNetwork":true,"capabilities":["connect","publish_image"]}'),
          ('YouTube', '{"provider":"youtube","realNetwork":true,"capabilities":["connect","upload_video"]}')
      ) AS provider_rows(name, details)
      WHERE NOT EXISTS (
        SELECT 1
        FROM integrations
        WHERE integrations.organization_id = organizations.id
          AND integrations.kind = 'social'
          AND integrations.details->>'provider' = provider_rows.details::jsonb->>'provider'
      )
    `);
        await client.query(`
      UPDATE integrations
      SET details = details || jsonb_build_object(
        'provider',
        CASE
          WHEN lower(name) LIKE 'linkedin%' THEN 'linkedin'
          WHEN lower(name) LIKE 'facebook%' THEN 'facebook'
          WHEN lower(name) LIKE 'instagram%' THEN 'instagram'
          WHEN lower(name) LIKE 'youtube%' THEN 'youtube'
          ELSE details->>'provider'
        END,
        'realNetwork',
        CASE
          WHEN lower(name) LIKE 'linkedin%' OR lower(name) LIKE 'facebook%' OR lower(name) LIKE 'instagram%' OR lower(name) LIKE 'youtube%'
            THEN true
          ELSE COALESCE((details->>'realNetwork')::boolean, false)
        END
      ),
      sync_frequency = CASE
        WHEN lower(name) LIKE 'linkedin%' OR lower(name) LIKE 'facebook%' OR lower(name) LIKE 'instagram%' OR lower(name) LIKE 'youtube%'
          THEN 'OAuth + sync manuelle'
        ELSE sync_frequency
      END,
      updated_at = NOW()
      WHERE kind = 'social'
    `);
        await client.query(`
      UPDATE integrations
      SET name = CASE
        WHEN details->>'provider' = 'linkedin' THEN 'LinkedIn'
        WHEN details->>'provider' = 'facebook' THEN 'Facebook Pages'
        WHEN details->>'provider' = 'instagram' THEN 'Instagram Business'
        WHEN details->>'provider' = 'youtube' THEN 'YouTube'
        ELSE name
      END,
      updated_at = NOW()
      WHERE kind = 'social'
        AND details->>'provider' IN ('linkedin', 'facebook', 'instagram', 'youtube')
    `);
        await client.query(`
      DELETE FROM integrations
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY organization_id, details->>'provider'
              ORDER BY
                CASE WHEN status = 'connected' THEN 0 WHEN status = 'attention' THEN 1 ELSE 2 END,
                (SELECT COUNT(*) FROM jsonb_each(details)) DESC,
                last_sync_at DESC NULLS LAST,
                created_at ASC
            ) AS row_number
          FROM integrations
          WHERE kind = 'social'
            AND details->>'provider' IN ('linkedin', 'facebook', 'instagram', 'youtube')
        ) ranked
        WHERE ranked.row_number > 1
      )
    `);
        await client.query(`
      UPDATE posts
      SET platforms = (
        SELECT COALESCE(
          jsonb_agg(CASE WHEN value = 'x' THEN 'facebook' ELSE value END),
          '[]'::jsonb
        )
        FROM jsonb_array_elements_text(platforms) AS value
      )
      WHERE platforms @> '["x"]'::jsonb
    `);
        await client.query(`
      UPDATE metrics_snapshots
      SET channel = 'facebook'
      WHERE channel = 'x'
    `);
        await client.query(`
      UPDATE trends
      SET platform = 'facebook'
      WHERE platform = 'x'
    `);
        await client.query(`
      UPDATE social_connections
      SET provider = 'facebook',
          updated_at = NOW()
      WHERE provider = 'x'
    `);
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
