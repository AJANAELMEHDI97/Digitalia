import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { signToken } from "../lib/jwt.js";
import { logEvent } from "../lib/logs.js";
import { dbRoleFromPlatformRole, normalizePlatformRole } from "../lib/roles.js";
import { parseOrRespond } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimit } from "../middleware/rateLimit.js";
const registerSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    organizationName: z.string().min(2),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
const onboardingSchema = z.object({
    step: z.string().min(2),
});
export const authRouter = Router();
const serializeAuthUser = (user: Record<string, any>, overrides: Record<string, any> = {}) => {
    const safeOverrides = overrides;
    const { passwordHash, password_hash, ...safeUser } = user;
    const normalizedRole = normalizePlatformRole(safeOverrides.role ?? user.role);
    return {
        ...safeUser,
        ...safeOverrides,
        role: normalizedRole,
    };
};
const getAuthKey = (request) => {
    const rawEmail = typeof request.body?.email === "string" ? request.body.email.toLowerCase() : "anon";
    return `${request.ip}:${rawEmail}`;
};
const loginRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: "Trop de tentatives de connexion. Reessayez dans quelques minutes.",
    keyFn: getAuthKey,
});
const registerRateLimit = createRateLimit({
    windowMs: 60 * 60 * 1000,
    max: 6,
    message: "Trop de tentatives d'inscription. Reessayez plus tard.",
    keyFn: getAuthKey,
});
authRouter.post("/register", registerRateLimit, async (request, response) => {
    const input = parseOrRespond(registerSchema, request.body, response);
    if (!input)
        return;
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
        input.email.toLowerCase(),
    ]);
    if (existing.rowCount) {
        return response
            .status(409)
            .json({ message: "Un compte existe deja avec cet email." });
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const slug = input.organizationName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const organizationResult = await client.query(`
        INSERT INTO organizations (name, slug, plan)
        VALUES ($1, $2, 'Starter')
        RETURNING id
      `, [input.organizationName, `${slug}-${Date.now().toString().slice(-4)}`]);
        const organizationId = organizationResult.rows[0].id;
        const passwordHash = await bcrypt.hash(input.password, 10);
        const userResult = await client.query(`
        INSERT INTO users (
          organization_id,
          full_name,
          email,
          password_hash,
          role,
          title,
          onboarding_steps,
          theme,
          notification_preferences
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'admin',
          'Super Admin',
          '["workspace"]'::jsonb,
          'aurora',
          '{"email":true,"push":true,"dailyDigest":true}'::jsonb
        )
        RETURNING id, email, role
      `, [organizationId, input.fullName, input.email.toLowerCase(), passwordHash]);
        await client.query(`
        INSERT INTO dashboard_preferences (user_id, layout)
        VALUES ($1, '{"hero":["performance","calendar"],"secondary":["approvals","notifications"]}'::jsonb)
      `, [userResult.rows[0].id]);
        await client.query(`
        INSERT INTO integrations (organization_id, name, kind, status, sync_frequency, details)
        VALUES
          ($1, 'LinkedIn', 'social', 'draft', 'OAuth + sync manuelle', '{"provider":"linkedin","realNetwork":true,"capabilities":["connect","publish_text"]}'::jsonb),
          ($1, 'Facebook Pages', 'social', 'draft', 'OAuth + sync manuelle', '{"provider":"facebook","realNetwork":true,"capabilities":["connect","publish_text","publish_image"]}'::jsonb),
          ($1, 'Instagram Business', 'social', 'draft', 'OAuth + sync manuelle', '{"provider":"instagram","realNetwork":true,"capabilities":["connect","publish_image"]}'::jsonb),
          ($1, 'YouTube', 'social', 'draft', 'OAuth + sync manuelle', '{"provider":"youtube","realNetwork":true,"capabilities":["connect","upload_video"]}'::jsonb),
          ($1, 'Google Calendar', 'productivity', 'draft', 'Temps reel', '{"calendar":"Editorial Planning"}'::jsonb),
          ($1, 'HubSpot CRM', 'crm', 'draft', 'Toutes les 6 heures', '{"pipeline":"Leads Social"}'::jsonb)
      `, [organizationId]);
        await client.query("COMMIT");
        await logEvent({
            organizationId,
            actorUserId: userResult.rows[0].id,
            eventKey: "user_registered",
            context: { email: userResult.rows[0].email },
        });
        const registeredUser = serializeAuthUser(userResult.rows[0], {
            fullName: input.fullName,
            organizationId,
        });
        const token = signToken({
            sub: userResult.rows[0].id,
            organizationId,
            role: registeredUser.role,
            email: userResult.rows[0].email,
        });
        return response.status(201).json({
            token,
            user: registeredUser,
        });
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
});
authRouter.post("/login", loginRateLimit, async (request, response) => {
    const input = parseOrRespond(loginSchema, request.body, response);
    if (!input)
        return;
    const result = await pool.query(`
      SELECT
        id,
        organization_id AS "organizationId",
        email,
        role,
        full_name AS "fullName",
        password_hash AS "passwordHash"
      FROM users
      WHERE email = $1
    `, [input.email.toLowerCase()]);
    if (!result.rowCount) {
        return response
            .status(401)
            .json({ message: "Email ou mot de passe incorrect." });
    }
    const user = result.rows[0];
    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
        await logEvent({
            organizationId: user.organizationId,
            actorUserId: user.id,
            eventKey: "login_failed",
            context: { email: input.email.toLowerCase() },
        });
        return response
            .status(401)
            .json({ message: "Email ou mot de passe incorrect." });
    }
    await logEvent({
        organizationId: user.organizationId,
        actorUserId: user.id,
        eventKey: "login_success",
        context: { email: user.email },
    });
    const authenticatedUser = serializeAuthUser(user);
    const token = signToken({
        sub: user.id,
        organizationId: user.organizationId,
        role: authenticatedUser.role,
        email: user.email,
    });
    return response.json({
        token,
        user: authenticatedUser,
    });
});
authRouter.get("/me", requireAuth, async (request, response) => {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.role,
        u.title,
        u.avatar_url AS "avatarUrl",
        u.bio,
        u.onboarding_steps AS "onboardingSteps",
        u.theme,
        u.two_factor_enabled AS "twoFactorEnabled",
        o.id AS "organizationId",
        o.name AS "organizationName",
        u.notification_preferences AS "notificationPreferences"
      FROM users u
      INNER JOIN organizations o ON o.id = u.organization_id
      WHERE u.id = $1
    `, [request.user.id]);
    return response.json(serializeAuthUser(result.rows[0]));
});
authRouter.put("/onboarding", requireAuth, async (request, response) => {
    const input = parseOrRespond(onboardingSchema, request.body, response);
    if (!input)
        return;
    const current = await pool.query(`
      SELECT onboarding_steps AS "onboardingSteps"
      FROM users
      WHERE id = $1
    `, [request.user.id]);
    const nextSteps = Array.from(new Set([...(current.rows[0]?.onboardingSteps ?? []), input.step]));
    await pool.query(`
      UPDATE users
      SET onboarding_steps = $2::jsonb,
          updated_at = NOW()
      WHERE id = $1
    `, [request.user.id, JSON.stringify(nextSteps)]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "onboarding_step_completed",
        context: { step: input.step },
    });
    return response.json({ onboardingSteps: nextSteps });
});
