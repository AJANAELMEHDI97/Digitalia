import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
const sampleMedia = [
    {
        folder: "Branding",
        name: "launch-banner.png",
        type: "image",
        format: "PNG",
        size: 420000,
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
        tags: ["brand", "campaign", "launch"],
        rights: "internal",
        author: "Design Team",
        usageCount: 12,
    },
    {
        folder: "Stories",
        name: "behind-the-scenes.mp4",
        type: "video",
        format: "MP4",
        size: 12400000,
        url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
        tags: ["video", "story"],
        rights: "licensed",
        author: "Studio",
        usageCount: 5,
    },
    {
        folder: "Podcast",
        name: "teaser-audio.mp3",
        type: "audio",
        format: "MP3",
        size: 3100000,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
        tags: ["audio", "teaser"],
        rights: "internal",
        author: "Audio Lab",
        usageCount: 3,
    },
    {
        folder: "Templates",
        name: "event-template.jpg",
        type: "image",
        format: "JPG",
        size: 890000,
        url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
        thumbnail: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=80",
        tags: ["template", "event"],
        rights: "internal",
        author: "Creative Squad",
        usageCount: 8,
    },
];
export const seedDatabase = async () => {
    const existingOrganizations = await pool.query("SELECT id FROM organizations LIMIT 1");
    if (existingOrganizations.rowCount && existingOrganizations.rowCount > 0) {
        return;
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const organizationResult = await client.query(`
        INSERT INTO organizations (name, slug, plan)
        VALUES ('Digitalia Studio', 'digitalia-studio', 'Business')
        RETURNING id
      `);
        const organizationId = organizationResult.rows[0].id;
        const passwordHash = await bcrypt.hash("demo1234", 10);
        const usersResult = await client.query(`
        INSERT INTO users (
          organization_id,
          full_name,
          email,
          password_hash,
          role,
          title,
          avatar_url,
          bio,
          onboarding_steps,
          theme,
          notification_preferences
        )
        VALUES
          (
            $1,
            'Nadia Bennani',
            'admin@socialpulse.local',
            $2,
            'admin',
            'Operations Director',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
            'Pilote la gouvernance editoriale et valide les campagnes.',
            '["workspace","channels","calendar","metrics"]'::jsonb,
            'aurora',
            '{"email": true, "push": true, "dailyDigest": true}'::jsonb
          ),
          (
            $1,
            'Sara El Idrissi',
            'editor@socialpulse.local',
            $2,
            'editor',
            'Social Media Manager',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
            'Coordonne la publication, la moderation et la production quotidienne.',
            '["workspace","channels"]'::jsonb,
            'aurora',
            '{"email": true, "push": true, "dailyDigest": false}'::jsonb
          ),
          (
            $1,
            'Youssef Haddad',
            'reader@socialpulse.local',
            $2,
            'reader',
            'Performance Analyst',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
            'Analyse les KPIs et partage les recommandations d''optimisation.',
            '["workspace"]'::jsonb,
            'aurora',
            '{"email": false, "push": true, "dailyDigest": true}'::jsonb
          )
        RETURNING id, role, email
      `, [organizationId, passwordHash]);
        const adminUserId = usersResult.rows.find((user) => user.role === "admin")?.id ??
            usersResult.rows[0].id;
        const editorUserId = usersResult.rows.find((user) => user.role === "editor")?.id ??
            usersResult.rows[0].id;
        const readerUserId = usersResult.rows.find((user) => user.role === "reader")?.id ??
            usersResult.rows[0].id;
        await client.query(`
        INSERT INTO dashboard_preferences (user_id, layout)
        VALUES
          ($1, '{"hero":["performance","calendar"],"secondary":["approvals","trends","notifications"]}'::jsonb),
          ($2, '{"hero":["calendar","inbox"],"secondary":["approvals","media","trends"]}'::jsonb)
      `, [adminUserId, editorUserId]);
        await client.query(`
        INSERT INTO integrations (organization_id, name, kind, status, sync_frequency, details, last_sync_at)
        VALUES
          ($1, 'LinkedIn Company Page', 'social', 'connected', 'Toutes les 15 min', '{"account":"Digitalia Studio","scope":["publish","analytics"]}'::jsonb, NOW() - INTERVAL '10 minutes'),
          ($1, 'Instagram Business', 'social', 'attention', 'Toutes les 30 min', '{"account":"@digitalia.agency","scope":["publish","messages"]}'::jsonb, NOW() - INTERVAL '1 hour'),
          ($1, 'Google Calendar', 'productivity', 'connected', 'Temps reel', '{"calendar":"Editorial Planning"}'::jsonb, NOW() - INTERVAL '5 minutes'),
          ($1, 'HubSpot CRM', 'crm', 'draft', 'Toutes les 6 heures', '{"pipeline":"Leads Social"}'::jsonb, NULL)
      `, [organizationId]);
        await client.query(`
        INSERT INTO calendar_events (
          organization_id,
          title,
          description,
          start_at,
          end_at,
          type,
          status,
          platform,
          assigned_user_id,
          timezone,
          metadata
        )
        VALUES
          ($1, 'Lancement campagne Ramadan', 'Kickoff editorial et attribution des roles.', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'campaign', 'scheduled', 'multi', $2, 'Africa/Casablanca', '{"color":"#ff8a4c"}'::jsonb),
          ($1, 'Revue approvals LinkedIn', 'Validation finale des posts du mardi.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 'approval', 'pending', 'linkedin', $3, 'Africa/Casablanca', '{"color":"#70f0b8"}'::jsonb),
          ($1, 'Publication Reel studio', 'Storytelling video pour Instagram.', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 30 minutes', 'post', 'scheduled', 'instagram', $3, 'Africa/Casablanca', '{"color":"#7a8cff"}'::jsonb),
          ($1, 'Point KPI mensuel', 'Synthese performance et recommandations.', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 90 minutes', 'meeting', 'scheduled', 'internal', $4, 'Africa/Casablanca', '{"color":"#f6d06f"}'::jsonb)
      `, [organizationId, adminUserId, editorUserId, readerUserId]);
        for (const media of sampleMedia) {
            await client.query(`
          INSERT INTO media_items (
            organization_id,
            folder,
            name,
            type,
            format,
            size_bytes,
            url,
            thumbnail_url,
            tags,
            rights,
            author_name,
            usage_count
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)
        `, [
                organizationId,
                media.folder,
                media.name,
                media.type,
                media.format,
                media.size,
                media.url,
                media.thumbnail,
                JSON.stringify(media.tags),
                media.rights,
                media.author,
                media.usageCount,
            ]);
        }
        const mediaResult = await client.query("SELECT id FROM media_items ORDER BY created_at ASC LIMIT 2");
        const firstMediaId = mediaResult.rows[0]?.id ?? null;
        const secondMediaId = mediaResult.rows[1]?.id ?? null;
        const postsResult = await client.query(`
        INSERT INTO posts (
          organization_id,
          author_id,
          title,
          content,
          platforms,
          status,
          scheduled_at,
          media_ids,
          preview,
          approval_required,
          hashtags,
          location
        )
        VALUES
          (
            $1,
            $2,
            'Teasing ouverture studio',
            'On ouvre les portes des coulisses Digitalia demain. Rendez-vous a 10h pour decouvrir notre nouvelle ligne editoriale.',
            '["linkedin","instagram"]'::jsonb,
            'approved',
            NOW() + INTERVAL '18 hours',
            $3::jsonb,
            '{"headline":"Teasing ouverture studio","hook":"Coulisses, vision, equipe","platformTone":"pro"}'::jsonb,
            TRUE,
            '["#Digitalia","#Launch","#SocialMedia"]'::jsonb,
            'Casablanca'
          ),
          (
            $1,
            $2,
            'Serie conseils community management',
            '3 ajustements simples pour ameliorer le taux de reponse de votre equipe cette semaine.',
            '["linkedin","facebook"]'::jsonb,
            'pending',
            NOW() + INTERVAL '2 days',
            $4::jsonb,
            '{"headline":"3 conseils CM","hook":"Rapide, concret, actionnable","platformTone":"expert"}'::jsonb,
            TRUE,
            '["#CommunityManagement","#Productivity"]'::jsonb,
            'Remote'
          ),
          (
            $1,
            $5,
            'Rapport KPI mars',
            'Le reach progresse de 18%, les clics de 12% et le delai de reponse passe sous les 20 minutes.',
            '["internal"]'::jsonb,
            'draft',
            NULL,
            '[]'::jsonb,
            '{"headline":"KPI mars","hook":"Reach, clics, rapidite","platformTone":"executive"}'::jsonb,
            FALSE,
            '["#Metrics","#Reporting"]'::jsonb,
            'Casablanca'
          )
        RETURNING id, status, title
      `, [
            organizationId,
            editorUserId,
            JSON.stringify(firstMediaId ? [firstMediaId] : []),
            JSON.stringify(secondMediaId ? [secondMediaId] : []),
            readerUserId,
        ]);
        const pendingPostId = postsResult.rows.find((post) => post.status === "pending")?.id ??
            postsResult.rows[0].id;
        await client.query(`
        INSERT INTO post_approvals (post_id, requested_by, reviewer_id, status, comment)
        VALUES
          ($1, $2, $3, 'pending', 'Merci de valider le wording et le CTA principal.')
      `, [pendingPostId, editorUserId, adminUserId]);
        await client.query(`
        INSERT INTO metrics_snapshots (
          organization_id,
          channel,
          period_label,
          reach,
          engagement,
          clicks,
          conversions,
          community_growth,
          captured_at
        )
        VALUES
          ($1, 'linkedin', '7 derniers jours', 48200, 3640, 910, 73, 4.2, NOW() - INTERVAL '1 hour'),
          ($1, 'instagram', '7 derniers jours', 62100, 5080, 1120, 91, 6.1, NOW() - INTERVAL '1 hour'),
          ($1, 'facebook', '7 derniers jours', 23100, 1470, 380, 24, 1.8, NOW() - INTERVAL '1 hour'),
          ($1, 'youtube', '7 derniers jours', 19200, 990, 240, 18, 2.4, NOW() - INTERVAL '1 hour'),
          ($1, 'linkedin', '30 derniers jours', 180200, 14800, 3920, 320, 12.8, NOW() - INTERVAL '1 day'),
          ($1, 'instagram', '30 derniers jours', 243500, 19640, 4250, 389, 16.4, NOW() - INTERVAL '1 day')
      `, [organizationId]);
        await client.query(`
        INSERT INTO trends (
          organization_id,
          platform,
          topic,
          volume,
          growth,
          region,
          language,
          sentiment,
          captured_at
        )
        VALUES
          ($1, 'linkedin', '#EmployeeAdvocacy', 8300, 18.4, 'MA', 'fr', 'positive', NOW() - INTERVAL '15 minutes'),
          ($1, 'instagram', '#StudioLife', 12400, 24.1, 'MA', 'fr', 'positive', NOW() - INTERVAL '20 minutes'),
          ($1, 'facebook', '#CMTips', 5600, 11.8, 'Global', 'en', 'neutral', NOW() - INTERVAL '35 minutes'),
          ($1, 'tiktok', '#BehindTheScenes', 18400, 31.2, 'Global', 'en', 'positive', NOW() - INTERVAL '50 minutes'),
          ($1, 'google', 'social media workflow', 4100, 9.6, 'MA', 'fr', 'positive', NOW() - INTERVAL '55 minutes')
      `, [organizationId]);
        const conversationResult = await client.query(`
        INSERT INTO conversations (
          organization_id,
          platform,
          contact_name,
          status,
          priority,
          assigned_user_id,
          last_message_at,
          unread_count,
          tags
        )
        VALUES
          ($1, 'instagram', 'Amina B.', 'open', 'high', $2, NOW() - INTERVAL '10 minutes', 2, '["lead","pricing"]'::jsonb),
          ($1, 'linkedin', 'Karim RH', 'assigned', 'medium', $3, NOW() - INTERVAL '1 hour', 1, '["partnership"]'::jsonb),
          ($1, 'facebook', 'Salma Agency', 'closed', 'low', $2, NOW() - INTERVAL '1 day', 0, '["support"]'::jsonb)
        RETURNING id
      `, [organizationId, editorUserId, adminUserId]);
        for (const conversation of conversationResult.rows) {
            await client.query(`
          INSERT INTO messages (conversation_id, sender_type, content)
          VALUES
            ($1, 'external', 'Bonjour, est-ce que vous gerez aussi la moderation et les messages prives ?'),
            ($1, 'internal', 'Oui, SocialPulse centralise la moderation, les reponses et l''assignation.')
        `, [conversation.id]);
        }
        await client.query(`
        INSERT INTO notifications (
          organization_id,
          user_id,
          type,
          title,
          body,
          priority,
          action_url,
          is_read,
          is_archived
        )
        VALUES
          ($1, $2, 'approval', '1 post attend votre validation', 'La publication "Serie conseils community management" doit etre validee avant demain.', 'high', '/app/approvals', FALSE, FALSE),
          ($1, $2, 'integration', 'Instagram necessite une reconnexion', 'Le token Instagram Business expire bientot. Verifiez les permissions.', 'medium', '/app/integrations', FALSE, FALSE),
          ($1, $3, 'inbox', 'Nouveau message client prioritaire', 'Amina B. demande un devis pour la gestion de communaute.', 'high', '/app/inbox', FALSE, FALSE),
          ($1, $2, 'digest', 'Resume quotidien pret', 'Vos metriques et taches cles sont a jour.', 'low', '/app/dashboard', TRUE, FALSE)
      `, [organizationId, adminUserId, editorUserId]);
        await client.query(`
        INSERT INTO global_rules (
          organization_id,
          name,
          scope,
          status,
          conditions,
          action,
          created_by
        )
        VALUES
          ($1, 'Validation obligatoire pour les posts multi-plateformes', 'posts', 'active', '{"platformCount":{"gte":2}}'::jsonb, '{"requireApproval":true}'::jsonb, $2),
          ($1, 'Archivage auto des notifications faibles apres 14 jours', 'notifications', 'active', '{"priority":"low","ageDays":{"gte":14}}'::jsonb, '{"archive":true}'::jsonb, $2)
      `, [organizationId, adminUserId]);
        await client.query(`
        INSERT INTO activity_logs (organization_id, actor_user_id, event_key, context)
        VALUES
          ($1, $2, 'workspace_seeded', '{"source":"bootstrap"}'::jsonb),
          ($1, $2, 'dashboard_viewed', '{"seed":true}'::jsonb),
          ($1, $3, 'post_approval_requested', '{"postTitle":"Serie conseils community management"}'::jsonb)
      `, [organizationId, adminUserId, editorUserId]);
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
