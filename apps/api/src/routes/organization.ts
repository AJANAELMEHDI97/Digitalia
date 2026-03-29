import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const inviteSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["admin", "editor", "reader"]),
    title: z.string().min(2),
});
export const organizationRouter = Router();
organizationRouter.use(requireAuth);
organizationRouter.get("/members", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        full_name AS "fullName",
        email,
        role,
        title,
        avatar_url AS "avatarUrl",
        created_at AS "createdAt"
      FROM users
      WHERE organization_id = $1
      ORDER BY created_at ASC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
organizationRouter.post("/members/invite", requireRole(["admin"]), async (request, response) => {
    const input = inviteSchema.parse(request.body);
    const existing = await pool.query("SELECT id FROM users WHERE organization_id = $1 AND email = $2", [request.user.organizationId, input.email.toLowerCase()]);
    if (existing.rowCount) {
        return response
            .status(409)
            .json({ message: "Ce membre existe déjà dans l'organisation." });
    }
    const result = await pool.query(`
        INSERT INTO users (
          organization_id,
          full_name,
          email,
          password_hash,
          role,
          title,
          onboarding_steps,
          notification_preferences
        )
        VALUES (
          $1,
          $2,
          $3,
          '$2a$10$Kr.P4bWPnDjWUy5tI5RQMentYtZ7LbQSvzftbCiT3w7U/gphM9Z/O',
          $4,
          $5,
          '["workspace"]'::jsonb,
          '{"email":true,"push":false,"dailyDigest":true}'::jsonb
        )
        RETURNING
          id,
          full_name AS "fullName",
          email,
          role,
          title,
          avatar_url AS "avatarUrl",
          created_at AS "createdAt"
      `, [
        request.user.organizationId,
        input.fullName,
        input.email.toLowerCase(),
        input.role,
        input.title,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "member_invited",
        context: { email: input.email, role: input.role },
    });
    return response.status(201).json(result.rows[0]);
});
