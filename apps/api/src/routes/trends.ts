import { Router } from "express";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
export const trendsRouter = Router();
trendsRouter.use(requireAuth);
trendsRouter.get("/", async (request, response) => {
    const platform = request.query.platform?.toString();
    const region = request.query.region?.toString();
    const conditions = ["organization_id = $1"];
    const params = [request.user.organizationId];
    if (platform) {
        params.push(platform);
        conditions.push(`platform = $${params.length}`);
    }
    if (region) {
        params.push(region);
        conditions.push(`region = $${params.length}`);
    }
    const result = await pool.query(`
      SELECT
        id,
        platform,
        topic,
        volume,
        growth,
        region,
        language,
        sentiment,
        captured_at AS "capturedAt"
      FROM trends
      WHERE ${conditions.join(" AND ")}
      ORDER BY growth DESC, captured_at DESC
    `, params);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "trends_viewed",
        context: { platform, region },
    });
    return response.json(result.rows);
});
