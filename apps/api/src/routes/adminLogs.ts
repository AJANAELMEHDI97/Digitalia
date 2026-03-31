import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminLogsRouter = Router();

// GET /admin/logs
// Query params: event, actor, from, to, limit, offset, format=csv
adminLogsRouter.get("/", requireAuth, requireRole(["super_admin"]), async (request, response) => {
  const q = [] as string[];
  const params: any[] = [];
  let idx = 1;

  q.push("SELECT id, organization_id AS \"organizationId\", actor_user_id AS \"actorUserId\", event_key AS \"eventKey\", context, created_at FROM activity_logs WHERE 1=1");

  // scope to requesting user's organization
  if (request.user?.organizationId) {
    q.push(`AND organization_id = $${idx}`);
    params.push(request.user.organizationId);
    idx++;
  }

  const { event, actor, from, to, limit = "100", offset = "0", format } = request.query;
  if (event) {
    q.push(`AND event_key = $${idx}`);
    params.push(String(event));
    idx++;
  }
  if (actor) {
    q.push(`AND actor_user_id = $${idx}`);
    params.push(String(actor));
    idx++;
  }
  if (from) {
    q.push(`AND created_at >= $${idx}`);
    params.push(String(from));
    idx++;
  }
  if (to) {
    q.push(`AND created_at <= $${idx}`);
    params.push(String(to));
    idx++;
  }

  q.push("ORDER BY created_at DESC");
  q.push(`LIMIT $${idx}`);
  params.push(Number(limit));
  idx++;
  q.push(`OFFSET $${idx}`);
  params.push(Number(offset));

  const sql = q.join("\n");
  const result = await pool.query(sql, params);

  const rows = result.rows.map((r: any) => ({
    id: r.id,
    organizationId: r.organizationId,
    actorUserId: r.actorUserId,
    eventKey: r.eventKey,
    context: r.context,
    created_at: r.created_at,
  }));

  if (String(format) === "csv") {
    let csv = "id,organizationId,actorUserId,eventKey,created_at,context\n";
    for (const row of rows) {
      const ctx = JSON.stringify(row.context || {}).replace(/"/g, '""');
      const created = row.created_at ? new Date(row.created_at).toISOString() : "";
      csv += `${row.id},${row.organizationId ?? ""},${row.actorUserId ?? ""},${row.eventKey ?? ""},${created},"${ctx}"\n`;
    }
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    return response.send(csv);
  }

  return response.json(rows);
});
