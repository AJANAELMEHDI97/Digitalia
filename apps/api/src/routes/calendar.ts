import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
const eventSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(3),
    startAt: z.string(),
    endAt: z.string(),
    type: z.string().min(2),
    status: z.string().min(2),
    platform: z.string().min(2),
    timezone: z.string().min(2).default("Africa/Casablanca"),
});
export const calendarRouter = Router();
calendarRouter.use(requireAuth);
calendarRouter.get("/events", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        start_at AS "startAt",
        end_at AS "endAt",
        type,
        status,
        platform,
        timezone,
        metadata
      FROM calendar_events
      WHERE organization_id = $1
      ORDER BY start_at ASC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
calendarRouter.post("/events", async (request, response) => {
    const input = eventSchema.parse(request.body);
    if (new Date(input.endAt) <= new Date(input.startAt)) {
        return response
            .status(400)
            .json({ message: "La date de fin doit être après la date de début." });
    }
    const result = await pool.query(`
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
        timezone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        title,
        description,
        start_at AS "startAt",
        end_at AS "endAt",
        type,
        status,
        platform,
        timezone,
        metadata
    `, [
        request.user.organizationId,
        input.title,
        input.description,
        input.startAt,
        input.endAt,
        input.type,
        input.status,
        input.platform,
        request.user.id,
        input.timezone,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "event_created",
        context: { title: input.title },
    });
    return response.status(201).json(result.rows[0]);
});
