import { Router } from "express";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
export const metricsRouter = Router();
metricsRouter.use(requireAuth);
metricsRouter.get("/", async (request, response) => {
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
        id,
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
        eventKey: "metrics_viewed",
        context: { channel, period },
    });
    return response.json(result.rows);
});
