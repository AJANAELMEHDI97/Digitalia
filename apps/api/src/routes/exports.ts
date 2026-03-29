import { Router } from "express";
import { pool } from "../db/pool.js";
import { buildCsv } from "../lib/csv.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
export const exportsRouter = Router();
exportsRouter.use(requireAuth);
exportsRouter.get("/metrics.csv", async (request, response) => {
    const channel = request.query.channel?.toString();
    const period = request.query.period?.toString();
    const conditions = ["organization_id = $1"];
    const params = [request.user.organizationId];
    if (channel) {
        params.push(channel);
        conditions.push(`channel = $${params.length}`);
    }
    if (period) {
        params.push(period);
        conditions.push(`period_label = $${params.length}`);
    }
    const result = await pool.query(`
      SELECT
        channel,
        period_label AS "periodLabel",
        reach,
        engagement,
        clicks,
        conversions,
        community_growth AS "communityGrowth",
        captured_at AS "capturedAt"
      FROM metrics_snapshots
      WHERE ${conditions.join(" AND ")}
      ORDER BY captured_at DESC
    `, params);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "metrics_exported",
        context: { format: "csv", channel, period },
    });
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="socialpulse-metrics.csv"');
    return response.send(buildCsv(result.rows, [
        { key: "channel", label: "Canal" },
        { key: "periodLabel", label: "Periode" },
        { key: "reach", label: "Reach" },
        { key: "engagement", label: "Engagement" },
        { key: "clicks", label: "Clics" },
        { key: "conversions", label: "Conversions" },
        { key: "communityGrowth", label: "Croissance communaute" },
        { key: "capturedAt", label: "Capture le" },
    ]));
});
exportsRouter.get("/posts.csv", async (request, response) => {
    const result = await pool.query(`
      SELECT
        p.title,
        p.status,
        p.platforms,
        p.scheduled_at AS "scheduledAt",
        p.published_at AS "publishedAt",
        p.hashtags,
        p.location,
        u.full_name AS "authorName"
      FROM posts p
      INNER JOIN users u ON u.id = p.author_id
      WHERE p.organization_id = $1
      ORDER BY p.updated_at DESC
    `, [request.user.organizationId]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "posts_exported",
        context: { format: "csv" },
    });
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="socialpulse-posts.csv"');
    return response.send(buildCsv(result.rows, [
        { key: "title", label: "Titre" },
        { key: "status", label: "Statut" },
        { key: "platforms", label: "Plateformes" },
        { key: "scheduledAt", label: "Planifie le" },
        { key: "publishedAt", label: "Publie le" },
        { key: "hashtags", label: "Hashtags" },
        { key: "location", label: "Localisation" },
        { key: "authorName", label: "Auteur" },
    ]));
});
exportsRouter.get("/workspace-summary.json", async (request, response) => {
    const [metricsResult, postsResult, mediaResult, integrationsResult] = await Promise.all([
        pool.query(`
          SELECT
            channel,
            period_label AS "periodLabel",
            reach,
            engagement,
            clicks,
            conversions,
            community_growth AS "communityGrowth",
            captured_at AS "capturedAt"
          FROM metrics_snapshots
          WHERE organization_id = $1
          ORDER BY captured_at DESC
        `, [request.user.organizationId]),
        pool.query(`
          SELECT
            title,
            status,
            platforms,
            scheduled_at AS "scheduledAt"
          FROM posts
          WHERE organization_id = $1
          ORDER BY updated_at DESC
        `, [request.user.organizationId]),
        pool.query(`
          SELECT
            name,
            type,
            folder,
            usage_count AS "usageCount"
          FROM media_items
          WHERE organization_id = $1
          ORDER BY created_at DESC
        `, [request.user.organizationId]),
        pool.query(`
          SELECT
            name,
            kind,
            status,
            sync_frequency AS "syncFrequency",
            last_sync_at AS "lastSyncAt"
          FROM integrations
          WHERE organization_id = $1
          ORDER BY created_at ASC
        `, [request.user.organizationId]),
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "workspace_exported",
        context: { format: "json" },
    });
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="socialpulse-workspace-summary.json"');
    return response.json({
        exportedAt: new Date().toISOString(),
        organizationId: request.user.organizationId,
        metrics: metricsResult.rows,
        posts: postsResult.rows,
        media: mediaResult.rows,
        integrations: integrationsResult.rows,
    });
});
