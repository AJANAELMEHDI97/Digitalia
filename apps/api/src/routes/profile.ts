import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { parseOrRespond } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
const notificationPreferencesSchema = z.object({
    email: z.boolean(),
    push: z.boolean(),
    dailyDigest: z.boolean(),
});
const profileSchema = z.object({
    fullName: z.string().min(2),
    title: z.string().min(2),
    bio: z.string().min(2),
    avatarUrl: z.string().url(),
    notificationPreferences: notificationPreferencesSchema,
});
const securitySchema = z
    .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
    enableTwoFactor: z.boolean(),
})
    .superRefine((input, context) => {
    if (input.newPassword !== input.confirmPassword) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirmPassword"],
            message: "La confirmation du mot de passe ne correspond pas.",
        });
    }
    if (input.currentPassword === input.newPassword) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["newPassword"],
            message: "Le nouveau mot de passe doit etre different de l'actuel.",
        });
    }
    const complexityChecks = [
        /[A-Z]/.test(input.newPassword),
        /[a-z]/.test(input.newPassword),
        /\d/.test(input.newPassword),
    ];
    if (complexityChecks.includes(false)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["newPassword"],
            message: "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.",
        });
    }
});
export const profileRouter = Router();
profileRouter.use(requireAuth);
profileRouter.get("/profile", async (request, response) => {
    const [profileResult, securityEventsResult] = await Promise.all([
        pool.query(`
        SELECT
          id,
          full_name AS "fullName",
          email,
          role,
          title,
          bio,
          avatar_url AS "avatarUrl",
          two_factor_enabled AS "twoFactorEnabled",
          notification_preferences AS "notificationPreferences"
        FROM users
        WHERE id = $1
      `, [request.user.id]),
        pool.query(`
        SELECT
          event_key AS "eventKey",
          context,
          created_at AS "createdAt"
        FROM activity_logs
        WHERE organization_id = $1
          AND actor_user_id = $2
          AND event_key IN (
            'login_success',
            'login_failed',
            'password_changed',
            '2fa_enabled',
            'unauthorized_access_attempt',
            'profile_updated'
          )
        ORDER BY created_at DESC
        LIMIT 6
      `, [request.user.organizationId, request.user.id]),
    ]);
    const profile = profileResult.rows[0];
    const notificationPreferences = profile.notificationPreferences ?? {
        email: true,
        push: true,
        dailyDigest: true,
    };
    const securityEvents = securityEventsResult.rows.map((row) => ({
        eventKey: row.eventKey,
        context: row.context,
        createdAt: row.createdAt,
    }));
    const hasRecentPasswordChange = securityEvents.some((event) => event.eventKey === "password_changed");
    const recentUnauthorizedAttempts = securityEvents.filter((event) => event.eventKey === "unauthorized_access_attempt").length;
    let securityScore = 35;
    if (profile.twoFactorEnabled)
        securityScore += 30;
    if (notificationPreferences.email)
        securityScore += 10;
    if (notificationPreferences.push)
        securityScore += 10;
    if (hasRecentPasswordChange)
        securityScore += 10;
    if (recentUnauthorizedAttempts === 0)
        securityScore += 5;
    const securityRecommendations = [
        !profile.twoFactorEnabled ? "Activez la double authentification." : null,
        !notificationPreferences.email ? "Activez les alertes email de securite." : null,
        !hasRecentPasswordChange ? "Mettez a jour votre mot de passe regulierement." : null,
    ].filter(Boolean);
    return response.json({
        ...profile,
        securityOverview: {
            score: securityScore,
            recommendations: securityRecommendations,
            recentEvents: securityEvents,
        },
    });
});
profileRouter.put("/profile", async (request, response) => {
    const input = parseOrRespond(profileSchema, request.body, response);
    if (!input)
        return;
    const result = await pool.query(`
      UPDATE users
      SET
        full_name = $2,
        title = $3,
        bio = $4,
        avatar_url = $5,
        notification_preferences = $6::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        full_name AS "fullName",
        email,
        role,
        title,
        bio,
        avatar_url AS "avatarUrl",
        two_factor_enabled AS "twoFactorEnabled",
        notification_preferences AS "notificationPreferences"
    `, [
        request.user.id,
        input.fullName,
        input.title,
        input.bio,
        input.avatarUrl,
        JSON.stringify(input.notificationPreferences),
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "profile_updated",
        context: { title: input.title, notificationPreferences: input.notificationPreferences },
    });
    return response.json(result.rows[0]);
});
profileRouter.put("/security", async (request, response) => {
    const input = parseOrRespond(securitySchema, request.body, response);
    if (!input)
        return;
    const current = await pool.query(`
      SELECT password_hash AS "passwordHash"
      FROM users
      WHERE id = $1
    `, [request.user.id]);
    const isValid = await bcrypt.compare(input.currentPassword, current.rows[0].passwordHash);
    if (!isValid) {
        await logEvent({
            organizationId: request.user.organizationId,
            actorUserId: request.user.id,
            eventKey: "unauthorized_access_attempt",
            context: { area: "security" },
        });
        return response
            .status(400)
            .json({ message: "Le mot de passe actuel est incorrect." });
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await pool.query(`
      UPDATE users
      SET password_hash = $2,
          two_factor_enabled = $3,
          updated_at = NOW()
      WHERE id = $1
    `, [request.user.id, passwordHash, input.enableTwoFactor]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "password_changed",
        context: { enableTwoFactor: input.enableTwoFactor },
    });
    if (input.enableTwoFactor) {
        await logEvent({
            organizationId: request.user.organizationId,
            actorUserId: request.user.id,
            eventKey: "2fa_enabled",
            context: { source: "profile_security" },
        });
    }
    return response.json({
        success: true,
        securityChecklist: {
            twoFactorEnabled: input.enableTwoFactor,
            passwordRotated: true,
        },
    });
});
