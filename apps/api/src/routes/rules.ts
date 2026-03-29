import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const ruleSchema = z.object({
    name: z.string().min(3),
    scope: z.string().min(2),
    status: z.enum(["active", "draft"]),
    conditions: z.record(z.any()),
    action: z.record(z.any()),
});
export const rulesRouter = Router();
rulesRouter.use(requireAuth);
rulesRouter.get("/", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        name,
        scope,
        status,
        conditions,
        action,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM global_rules
      WHERE organization_id = $1
      ORDER BY updated_at DESC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
rulesRouter.post("/", requireRole(["admin"]), async (request, response) => {
    const input = ruleSchema.parse(request.body);
    const result = await pool.query(`
        INSERT INTO global_rules (
          organization_id,
          name,
          scope,
          status,
          conditions,
          action,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
        RETURNING
          id,
          name,
          scope,
          status,
          conditions,
          action,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `, [
        request.user.organizationId,
        input.name,
        input.scope,
        input.status,
        JSON.stringify(input.conditions),
        JSON.stringify(input.action),
        request.user.id,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "rule_created",
        context: { name: input.name, scope: input.scope },
    });
    return response.status(201).json(result.rows[0]);
});
