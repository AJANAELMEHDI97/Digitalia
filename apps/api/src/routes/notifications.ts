import { Router } from "express";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.get("/", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        type,
        title,
        body,
        priority,
        action_url AS "actionUrl",
        metadata,
        is_read AS "isRead",
        is_archived AS "isArchived",
        created_at AS "createdAt"
      FROM notifications
      WHERE organization_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `, [request.user.organizationId, request.user.id]);
    return response.json(result.rows);
});
notificationsRouter.put("/:id/read", async (request, response) => {
    await pool.query(`
      UPDATE notifications
      SET is_read = TRUE,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
    `, [request.params.id, request.user.id]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "notification_read",
        context: { notificationId: request.params.id },
    });
    return response.json({ success: true });
});
notificationsRouter.put("/:id/archive", async (request, response) => {
    await pool.query(`
      UPDATE notifications
      SET is_archived = TRUE,
          updated_at = NOW()
      WHERE id = $1 AND user_id = $2
    `, [request.params.id, request.user.id]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "notification_archived",
        context: { notificationId: request.params.id },
    });
    return response.json({ success: true });
});
