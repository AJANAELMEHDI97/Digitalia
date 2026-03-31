import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { PLATFORM_ROLES, dbRoleFromPlatformRole, normalizePlatformRole } from "../lib/roles.js";
import { parseOrRespond } from "../lib/validation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const memberSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(PLATFORM_ROLES),
  title: z.string().min(2).optional(),
});

const roleUpdateSchema = z.object({
  role: z.enum(PLATFORM_ROLES),
});

const defaultTitleByRole = {
  super_admin: "Super Admin",
  community_manager: "Community Manager",
  lawyer: "Avocat",
};

const serializeMember = (member) => ({
  ...member,
  role: normalizePlatformRole(member.role),
});

const createMember = async (request, response) => {
  const input = parseOrRespond(memberSchema, request.body, response);
  if (!input) return;

  const normalizedRole = normalizePlatformRole(input.role);
  const dbRole = dbRoleFromPlatformRole(normalizedRole);
  const email = input.email.toLowerCase();
  const existing = await pool.query(
    "SELECT id FROM users WHERE organization_id = $1 AND email = $2",
    [request.user.organizationId, email],
  );

  if (existing.rowCount) {
    return response
      .status(409)
      .json({ message: "Ce membre existe deja dans l'organisation." });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await pool.query(
    `
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
        $4,
        $5,
        $6,
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
    `,
    [
      request.user.organizationId,
      input.fullName,
      email,
      passwordHash,
      dbRole,
      input.title ?? defaultTitleByRole[normalizedRole],
    ],
  );

  await logEvent({
    organizationId: request.user.organizationId,
    actorUserId: request.user.id,
    eventKey: "member_created",
    context: { email, role: normalizedRole },
  });

  return response.status(201).json(serializeMember(result.rows[0]));
};

export const organizationRouter = Router();

organizationRouter.use(requireAuth);

organizationRouter.get("/members", requireRole(["super_admin"]), async (request, response) => {
  const result = await pool.query(
    `
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
    `,
    [request.user.organizationId],
  );

  return response.json(result.rows.map(serializeMember));
});

organizationRouter.post("/members", requireRole(["super_admin"]), createMember);
organizationRouter.post("/members/invite", requireRole(["super_admin"]), createMember);

organizationRouter.patch(
  "/members/:memberId/role",
  requireRole(["super_admin"]),
  async (request, response) => {
    const input = parseOrRespond(roleUpdateSchema, request.body, response);
    if (!input) return;

    const normalizedRole = normalizePlatformRole(input.role);
    const dbRole = dbRoleFromPlatformRole(normalizedRole);

    if (request.params.memberId === request.user.id && normalizedRole !== "super_admin") {
      return response.status(400).json({
        message: "Le Super Admin actif ne peut pas se retrograder lui-meme.",
      });
    }

    const result = await pool.query(
      `
        UPDATE users
        SET role = $1,
            title = $2,
            updated_at = NOW()
        WHERE id = $3
          AND organization_id = $4
        RETURNING
          id,
          full_name AS "fullName",
          email,
          role,
          title,
          avatar_url AS "avatarUrl",
          created_at AS "createdAt"
      `,
      [
        dbRole,
        defaultTitleByRole[normalizedRole],
        request.params.memberId,
        request.user.organizationId,
      ],
    );

    if (!result.rowCount) {
      return response.status(404).json({ message: "Utilisateur introuvable." });
    }

    await logEvent({
      organizationId: request.user.organizationId,
      actorUserId: request.user.id,
      eventKey: "member_role_updated",
      context: { memberId: request.params.memberId, role: normalizedRole },
    });

    return response.json(serializeMember(result.rows[0]));
  },
);
