import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
export const normalizeLegacyWorkspaceData = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const primaryPasswordHash = await bcrypt.hash("Nassima123", 10);
        await client.query(`
      UPDATE organizations
      SET plan = 'Business'
      WHERE slug = 'digitalia-studio'
    `);
        await client.query(`
      UPDATE users
      SET email = CONCAT('archived+', split_part(id::text, '-', 1), '@socialpulse.local'),
          updated_at = NOW()
      WHERE email = 'nassimelhattabi@gmail.com'
        AND organization_id NOT IN (
          SELECT id FROM organizations WHERE slug = 'digitalia-studio'
        )
    `);
        await client.query(`
      UPDATE users
      SET
        full_name = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN 'Nassima Elhattabi'
          WHEN email = 'editor@socialpulse.local' THEN 'Sara El Idrissi'
          WHEN email = 'reader@socialpulse.local' THEN 'Youssef Haddad'
          ELSE full_name
        END,
        email = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN 'nassimelhattabi@gmail.com'
          ELSE email
        END,
        password_hash = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN $1
          ELSE password_hash
        END,
        role = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN 'editor'
          WHEN role = 'super_admin' THEN 'admin'
          WHEN role = 'community_manager' THEN 'editor'
          WHEN role = 'lawyer' THEN 'reader'
          ELSE role
        END,
        title = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN 'Community Manager'
          WHEN role = 'admin' THEN 'Super Admin'
          WHEN email = 'editor@socialpulse.local' THEN 'Social Media Manager'
          WHEN email = 'reader@socialpulse.local' THEN 'Performance Analyst'
          ELSE title
        END,
        bio = CASE
          WHEN email = 'nassimelhattabi@gmail.com' THEN 'Pilote la production editoriale et la coordination des contenus SocialPulse.'
          WHEN email = 'editor@socialpulse.local' THEN 'Coordonne la publication, la moderation et la production quotidienne.'
          WHEN email = 'reader@socialpulse.local' THEN 'Analyse les KPIs et partage les recommandations d''optimisation.'
          ELSE bio
        END
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND (
          role IN ('admin', 'editor', 'reader')
          OR email = 'nassimelhattabi@gmail.com'
          OR email IN (
          'editor@socialpulse.local',
          'reader@socialpulse.local'
        )
        )
    `, [primaryPasswordHash]);
        await client.query(`
      UPDATE integrations
      SET sync_frequency = 'Temps reel'
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND name = 'Google Calendar'
    `);
        await client.query(`
      UPDATE integrations
      SET
        details = details || jsonb_build_object(
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
        )
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND kind = 'social'
    `);
        await client.query(`
      UPDATE integrations
      SET name = CASE
        WHEN details->>'provider' = 'linkedin' THEN 'LinkedIn'
        WHEN details->>'provider' = 'facebook' THEN 'Facebook Pages'
        WHEN details->>'provider' = 'instagram' THEN 'Instagram Business'
        WHEN details->>'provider' = 'youtube' THEN 'YouTube'
        ELSE name
      END
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND kind = 'social'
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
          WHERE organization_id IN (
            SELECT id FROM organizations WHERE slug = 'digitalia-studio'
          )
            AND kind = 'social'
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
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND platforms @> '["x"]'::jsonb
    `);
        await client.query(`
      UPDATE metrics_snapshots
      SET channel = 'facebook'
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND channel = 'x'
    `);
        await client.query(`
      UPDATE trends
      SET platform = 'facebook'
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND platform = 'x'
    `);
        await client.query(`
      UPDATE calendar_events
      SET description = CASE
        WHEN title = 'Lancement campagne Ramadan' THEN 'Kickoff editorial et attribution des roles.'
        WHEN title = 'Publication Reel studio' THEN 'Storytelling video pour Instagram.'
        WHEN title = 'Point KPI mensuel' THEN 'Synthese performance et recommandations.'
        ELSE description
      END
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND title IN (
          'Lancement campagne Ramadan',
          'Publication Reel studio',
          'Point KPI mensuel'
        )
    `);
        await client.query(`
      UPDATE posts
      SET
        content = 'On ouvre les portes des coulisses Digitalia demain. Rendez-vous a 10h pour decouvrir notre nouvelle ligne editoriale.',
        preview = '{"headline":"Teasing ouverture studio","hook":"Coulisses, vision, equipe","platformTone":"pro"}'::jsonb
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND title = 'Teasing ouverture studio'
    `);
        await client.query(`
      UPDATE posts
      SET
        title = 'Serie conseils community management',
        content = '3 ajustements simples pour ameliorer le taux de reponse de votre equipe cette semaine.',
        preview = '{"headline":"3 conseils CM","hook":"Rapide, concret, actionnable","platformTone":"expert"}'::jsonb
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND (
          title = 'Serie conseils community management'
          OR preview->>'headline' = '3 conseils CM'
          OR hashtags @> '["#CommunityManagement"]'::jsonb
        )
        AND location = 'Remote'
    `);
        await client.query(`
      UPDATE posts
      SET
        content = 'Le reach progresse de 18%, les clics de 12% et le delai de reponse passe sous les 20 minutes.',
        preview = '{"headline":"KPI mars","hook":"Reach, clics, rapidite","platformTone":"executive"}'::jsonb
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND title = 'Rapport KPI mars'
    `);
        await client.query(`
      UPDATE post_approvals
      SET comment = 'Validation demandee depuis l''editeur.'
      WHERE post_id IN (
        SELECT id
        FROM posts
        WHERE organization_id IN (
          SELECT id FROM organizations WHERE slug = 'digitalia-studio'
        )
      )
        AND comment LIKE 'Validation demand%'
    `);
        await client.query(`
      UPDATE messages
      SET content = CASE
        WHEN sender_type = 'external'
          THEN 'Bonjour, est-ce que vous gerez aussi la moderation et les messages prives ?'
        WHEN sender_type = 'internal'
          THEN 'Oui, SocialPulse centralise la moderation, les reponses et l''assignation.'
        ELSE content
      END
      WHERE conversation_id IN (
        SELECT id
        FROM conversations
        WHERE organization_id IN (
          SELECT id FROM organizations WHERE slug = 'digitalia-studio'
        )
      )
        AND (
          (sender_type = 'external' AND content LIKE 'Bonjour, est-ce que vous %')
          OR (sender_type = 'internal' AND content LIKE 'Oui, SocialPulse centralise %')
        )
    `);
        await client.query(`
      UPDATE notifications
      SET
        title = CASE
          WHEN type = 'integration' THEN 'Instagram necessite une reconnexion'
          WHEN type = 'digest' THEN 'Resume quotidien pret'
          ELSE title
        END,
        body = CASE
          WHEN type = 'approval' THEN 'La publication "Serie conseils community management" doit etre validee avant demain.'
          WHEN type = 'integration' THEN 'Le token Instagram Business expire bientot. Verifiez les permissions.'
          WHEN type = 'inbox' THEN 'Amina B. demande un devis pour la gestion de communaute.'
          WHEN type = 'digest' THEN 'Vos metriques et taches cles sont a jour.'
          ELSE body
        END
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND type IN ('approval', 'integration', 'inbox', 'digest')
    `);
        await client.query(`
      UPDATE global_rules
      SET name = 'Archivage auto des notifications faibles apres 14 jours'
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND scope = 'notifications'
    `);
        await client.query(`
      UPDATE activity_logs
      SET context = '{"postTitle":"Serie conseils community management"}'::jsonb
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'digitalia-studio'
      )
        AND event_key = 'post_approval_requested'
        AND context::text LIKE '%community%'
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
