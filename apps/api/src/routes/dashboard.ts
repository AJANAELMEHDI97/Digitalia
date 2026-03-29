import { Router } from "express";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
export const dashboardRouter = Router();
dashboardRouter.get("/", requireAuth, async (request, response) => {
    const organizationId = request.user.organizationId;
    const [counts, metrics, upcomingEvents, pendingPosts, notifications, trends] = await Promise.all([
        pool.query(`
          SELECT
            (SELECT COUNT(*)::text FROM posts WHERE organization_id = $1) AS posts,
            (SELECT COUNT(*)::text FROM calendar_events WHERE organization_id = $1 AND start_at >= NOW()) AS "scheduledEvents",
            (SELECT COUNT(*)::text FROM conversations WHERE organization_id = $1 AND status != 'closed') AS "openConversations",
            (
              (
                SELECT COUNT(*)
                FROM social_connections
                WHERE organization_id = $1 AND status = 'active'
              ) +
              (
                SELECT COUNT(*)
                FROM integrations
                WHERE organization_id = $1 AND kind != 'social' AND status = 'connected'
              )
            )::text AS "activeIntegrations"
        `, [organizationId]),
        pool.query(`
          SELECT
            channel,
            period_label AS "periodLabel",
            reach,
            engagement,
            clicks,
            conversions,
            community_growth AS "communityGrowth"
          FROM metrics_snapshots
          WHERE organization_id = $1
          ORDER BY captured_at DESC
          LIMIT 6
        `, [organizationId]),
        pool.query(`
          SELECT
            id,
            title,
            start_at AS "startAt",
            end_at AS "endAt",
            type,
            status,
            platform
          FROM calendar_events
          WHERE organization_id = $1
          ORDER BY start_at ASC
          LIMIT 5
        `, [organizationId]),
        pool.query(`
          SELECT
            id,
            title,
            status,
            scheduled_at AS "scheduledAt",
            platforms
          FROM posts
          WHERE organization_id = $1
          ORDER BY updated_at DESC
          LIMIT 5
        `, [organizationId]),
        pool.query(`
          SELECT
            id,
            type,
            title,
            body,
            priority,
            metadata,
            is_read AS "isRead",
            created_at AS "createdAt"
          FROM notifications
          WHERE organization_id = $1 AND user_id = $2
          ORDER BY created_at DESC
          LIMIT 6
        `, [organizationId, request.user.id]),
        pool.query(`
          SELECT
            id,
            platform,
            topic,
            volume,
            growth,
            region,
            captured_at AS "capturedAt"
          FROM trends
          WHERE organization_id = $1
          ORDER BY captured_at DESC
          LIMIT 5
        `, [organizationId]),
    ]);
    await logEvent({
        organizationId,
        actorUserId: request.user.id,
        eventKey: "dashboard_viewed",
        context: { userId: request.user.id },
    });
    return response.json({
        stats: counts.rows[0],
        metrics: metrics.rows,
        upcomingEvents: upcomingEvents.rows,
        pendingPosts: pendingPosts.rows,
        notifications: notifications.rows,
        trends: trends.rows,
    });
});
