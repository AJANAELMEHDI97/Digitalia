import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { requireAuth } from "../middleware/auth.js";
const replySchema = z.object({
    content: z.string().min(2),
});
const assignSchema = z.object({
    userId: z.string().uuid(),
});
export const inboxRouter = Router();
inboxRouter.use(requireAuth);
inboxRouter.get("/", async (request, response) => {
    const conversations = await pool.query(`
      SELECT
        c.id,
        c.platform,
        c.contact_name AS "contactName",
        c.status,
        c.priority,
        c.assigned_user_id AS "assignedUserId",
        c.last_message_at AS "lastMessageAt",
        c.unread_count AS "unreadCount",
        c.tags,
        u.full_name AS "assignedUserName"
      FROM conversations c
      LEFT JOIN users u ON u.id = c.assigned_user_id
      WHERE c.organization_id = $1
      ORDER BY c.last_message_at DESC
    `, [request.user.organizationId]);
    const messages = await pool.query(`
      SELECT
        m.id,
        m.conversation_id AS "conversationId",
        m.sender_type AS "senderType",
        m.content,
        m.created_at AS "createdAt"
      FROM messages m
      INNER JOIN conversations c ON c.id = m.conversation_id
      WHERE c.organization_id = $1
      ORDER BY m.created_at ASC
    `, [request.user.organizationId]);
    return response.json({
        conversations: conversations.rows,
        messages: messages.rows,
    });
});
inboxRouter.post("/:conversationId/reply", async (request, response) => {
    const input = replySchema.parse(request.body);
    await pool.query(`
      INSERT INTO messages (conversation_id, sender_type, content)
      VALUES ($1, 'internal', $2)
    `, [request.params.conversationId, input.content]);
    await pool.query(`
      UPDATE conversations
      SET status = 'assigned',
          unread_count = 0,
          last_message_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
    `, [request.params.conversationId, request.user.organizationId]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "message_replied",
        context: { conversationId: request.params.conversationId },
    });
    return response.status(201).json({ success: true });
});
inboxRouter.put("/:conversationId/assign", async (request, response) => {
    const input = assignSchema.parse(request.body);
    await pool.query(`
      UPDATE conversations
      SET assigned_user_id = $2,
          status = 'assigned',
          updated_at = NOW()
      WHERE id = $1 AND organization_id = $3
    `, [request.params.conversationId, input.userId, request.user.organizationId]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "conversation_assigned",
        context: { conversationId: request.params.conversationId, assignedUserId: input.userId },
    });
    return response.json({ success: true });
});
