import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { syncPostWorkflowArtifacts, } from "../lib/postWorkflow.js";
import { decryptSensitiveValue, deleteViaProvider, encryptSensitiveValue, publishViaProvider, } from "../lib/social.js";
import { parseOrRespond } from "../lib/validation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const postStatusSchema = z.enum(["draft", "pending", "approved", "scheduled", "rejected", "published"]);
const postSourceSchema = z.enum(["manual", "socialpulse"]);
const prioritySchema = z.enum(["routine", "important", "strategique"]);
const postSchema = z.object({
    title: z.string().optional().default(""),
    content: z.string().min(10),
    platforms: z.array(z.string()).min(1),
    status: postStatusSchema,
    scheduledAt: z.string().nullable().optional(),
    approvalRequired: z.boolean().default(true),
    hashtags: z.array(z.string()).default([]),
    location: z.string().optional().default(""),
    mediaIds: z.array(z.string()).default([]),
    targetConnections: z.array(z.string()).default([]),
    lawFirmId: z.string().nullable().optional(),
    source: postSourceSchema.default("manual"),
    imageUrl: z.string().nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    priority: prioritySchema.nullable().optional(),
});
const postUpdateSchema = z.object({
    title: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    platforms: z.array(z.string()).min(1).optional(),
    status: postStatusSchema.optional(),
    scheduledAt: z.string().nullable().optional(),
    approvalRequired: z.boolean().optional(),
    hashtags: z.array(z.string()).optional(),
    location: z.string().optional(),
    mediaIds: z.array(z.string()).optional(),
    targetConnections: z.array(z.string()).optional(),
    lawFirmId: z.string().nullable().optional(),
    source: postSourceSchema.optional(),
    imageUrl: z.string().nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    priority: prioritySchema.nullable().optional(),
    rejectionReason: z.string().nullable().optional(),
    modificationRequestComment: z.string().nullable().optional(),
}).refine((input) => Object.keys(input).length > 0, {
    message: "Au moins un champ doit etre fourni.",
});
const previewSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    platforms: z.array(z.string()).min(1),
});
const decisionSchema = z.object({
    comment: z.string().optional().default(""),
});
const buildPostTitle = (title, content) => {
    const normalizedTitle = title.trim();
    if (normalizedTitle.length >= 3) {
        return normalizedTitle;
    }
    return content.replace(/\s+/g, " ").trim().slice(0, 80);
};
const buildPreviewPayload = (title, content, platforms) => ({
    headline: title,
    hook: content.slice(0, 120),
    platformTone: platforms.length > 1 ? "multi-channel" : platforms[0],
});
const deleteWorkflowArtifacts = async ({ organizationId, postId, }) => {
    await Promise.all([
        pool.query(`
        DELETE FROM notifications
        WHERE organization_id = $1
          AND metadata->>'source' = 'workflow-post'
          AND metadata->>'postId' = $2
      `, [organizationId, postId]),
        pool.query(`
        DELETE FROM calendar_events
        WHERE organization_id = $1
          AND metadata->>'source' = 'workflow-post'
          AND metadata->>'postId' = $2
      `, [organizationId, postId]),
    ]);
};
const ensurePendingApproval = async ({ postId, reviewerId, requestedBy, comment, }) => {
    await pool.query(`
      UPDATE post_approvals
      SET status = 'rejected'
      WHERE post_id = $1 AND status = 'pending'
    `, [postId]);
    await pool.query(`
      INSERT INTO post_approvals (post_id, requested_by, reviewer_id, status, comment)
      VALUES ($1, $2, $3, 'pending', $4)
    `, [postId, requestedBy, reviewerId, comment]);
};
const mapAuditEvent = (eventKey) => {
    switch (eventKey) {
        case "post_approval_requested":
            return {
                action: "submitted_for_validation",
                newStatus: "submitted_to_lawyer",
            };
        case "post_approved":
            return {
                action: "validated",
                newStatus: "validated",
            };
        case "post_rejected":
            return {
                action: "refused",
                newStatus: "refused",
            };
        case "post_modification_requested":
            return {
                action: "modification_requested",
                newStatus: "modified_by_lawyer",
            };
        case "post_published":
        case "scheduled_post_published":
            return {
                action: "published",
                newStatus: "published",
            };
        default:
            return {
                action: eventKey,
                newStatus: null,
            };
    }
};
const toStoredConnection = (row) => ({
    id: row.id,
    organizationId: row.organizationId,
    integrationId: row.integrationId,
    provider: row.provider,
    accountId: row.accountId,
    accountName: row.accountName,
    accountHandle: row.accountHandle,
    accountType: row.accountType,
    avatarUrl: row.avatarUrl,
    accessToken: decryptSensitiveValue(row.accessTokenEncrypted) ?? "",
    refreshToken: decryptSensitiveValue(row.refreshTokenEncrypted),
    tokenExpiresAt: row.tokenExpiresAt,
    scopes: row.scopes,
    metadata: row.metadata,
    status: row.status,
});
const loadStoredConnections = async (organizationId) => {
    const result = await pool.query(`
      SELECT
        id,
        organization_id AS "organizationId",
        integration_id AS "integrationId",
        provider,
        account_id AS "accountId",
        account_name AS "accountName",
        account_handle AS "accountHandle",
        account_type AS "accountType",
        avatar_url AS "avatarUrl",
        access_token AS "accessTokenEncrypted",
        refresh_token AS "refreshTokenEncrypted",
        token_expires_at AS "tokenExpiresAt",
        scopes,
        metadata,
        status
      FROM social_connections
      WHERE organization_id = $1
        AND status = 'active'
    `, [organizationId]);
    return result.rows.map(toStoredConnection);
};
const loadMediaItems = async (organizationId, mediaIds) => {
    if (!mediaIds.length) {
        return [];
    }
    const result = await pool.query(`
      SELECT
        id,
        name,
        type,
        format,
        url,
        thumbnail_url AS "thumbnailUrl"
      FROM media_items
      WHERE organization_id = $1
        AND id = ANY($2::uuid[])
    `, [organizationId, mediaIds]);
    return result.rows;
};
const loadPostWorkflowSnapshot = async ({ organizationId, postId, }) => {
    const result = await pool.query(`
      SELECT
        id,
        organization_id AS "organizationId",
        author_id AS "authorId",
        title,
        content,
        platforms,
        status,
        scheduled_at AS "scheduledAt",
        published_at AS "publishedAt"
      FROM posts
      WHERE organization_id = $1
        AND id = $2
    `, [organizationId, postId]);
    return result.rows[0] ?? null;
};
const storePublicationAttempt = async ({ organizationId, postId, attempt, }) => {
    await pool.query(`
      INSERT INTO post_publications (
        organization_id,
        post_id,
        social_connection_id,
        provider,
        status,
        external_post_id,
        published_url,
        error_message,
        response_data,
        published_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9::jsonb,
        CASE WHEN $5 = 'published' THEN NOW() ELSE NULL END,
        NOW()
      )
    `, [
        organizationId,
        postId,
        attempt.connectionId,
        attempt.provider,
        attempt.status,
        attempt.externalPostId,
        attempt.publishedUrl,
        attempt.errorMessage,
        JSON.stringify(attempt.responseData),
    ]);
};
const publishPostToNetworks = async ({ organizationId, post, mediaIds, }) => {
    const [connections, mediaItems] = await Promise.all([
        loadStoredConnections(organizationId),
        loadMediaItems(organizationId, mediaIds),
    ]);
    const scopedConnections = post.targetConnections.length
        ? connections.filter((connection) => post.targetConnections.includes(connection.id))
        : connections.filter((connection) => post.platforms.includes(connection.provider));
    if (!scopedConnections.length) {
        return {
            attempts: [],
            successCount: 0,
            failureCount: 0,
        };
    }
    const attempts = [];
    for (const connection of scopedConnections) {
        try {
            const result = await publishViaProvider({
                connection,
                post,
                mediaItems,
            });
            attempts.push({
                provider: connection.provider,
                connectionId: connection.id,
                status: "published",
                externalPostId: result.externalPostId,
                publishedUrl: result.publishedUrl,
                errorMessage: null,
                responseData: result.responseData,
            });
        }
        catch (error) {
            attempts.push({
                provider: connection.provider,
                connectionId: connection.id,
                status: "failed",
                externalPostId: null,
                publishedUrl: null,
                errorMessage: error instanceof Error ? error.message : "Publication impossible.",
                responseData: {},
            });
        }
    }
    for (const attempt of attempts) {
        await storePublicationAttempt({
            organizationId,
            postId: post.id,
            attempt,
        });
    }
    return {
        attempts,
        successCount: attempts.filter((attempt) => attempt.status === "published").length,
        failureCount: attempts.filter((attempt) => attempt.status === "failed").length,
    };
};
let scheduledPublishInFlight = false;
export const publishDueScheduledPosts = async () => {
    if (scheduledPublishInFlight) {
        return;
    }
    scheduledPublishInFlight = true;
    try {
        const duePosts = await pool.query(`
        SELECT
          id,
          organization_id AS "organizationId",
          title,
          content,
          hashtags,
          platforms,
          target_connections AS "targetConnections",
          media_ids AS "mediaIds"
        FROM posts
        WHERE status = 'scheduled'
          AND scheduled_at IS NOT NULL
          AND scheduled_at <= NOW()
        ORDER BY scheduled_at ASC
        LIMIT 10
      `);
        for (const post of duePosts.rows) {
            const publicationOutcome = await publishPostToNetworks({
                organizationId: post.organizationId,
                post: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    hashtags: post.hashtags,
                    platforms: post.platforms,
                    targetConnections: post.targetConnections,
                },
                mediaIds: post.mediaIds,
            });
            if (publicationOutcome.successCount > 0) {
                await pool.query(`
            UPDATE posts
            SET status = 'published',
                published_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
          `, [post.id]);
                await logEvent({
                    organizationId: post.organizationId,
                    eventKey: "scheduled_post_published",
                    context: {
                        postId: post.id,
                        successCount: publicationOutcome.successCount,
                        failureCount: publicationOutcome.failureCount,
                    },
                });
                const workflowSnapshot = await loadPostWorkflowSnapshot({
                    organizationId: post.organizationId,
                    postId: post.id,
                });
                if (workflowSnapshot) {
                    await syncPostWorkflowArtifacts(workflowSnapshot);
                }
            }
            else {
                await pool.query(`
            UPDATE posts
            SET status = 'approved',
                updated_at = NOW()
            WHERE id = $1
          `, [post.id]);
                await logEvent({
                    organizationId: post.organizationId,
                    eventKey: "scheduled_post_failed",
                    context: {
                        postId: post.id,
                        failureCount: publicationOutcome.failureCount,
                    },
                });
                const workflowSnapshot = await loadPostWorkflowSnapshot({
                    organizationId: post.organizationId,
                    postId: post.id,
                });
                if (workflowSnapshot) {
                    await syncPostWorkflowArtifacts(workflowSnapshot);
                }
            }
        }
    }
    finally {
        scheduledPublishInFlight = false;
    }
};
export const postsRouter = Router();
postsRouter.use(requireAuth);
postsRouter.get("/", async (request, response) => {
    const result = await pool.query(`
      SELECT
        p.id,
        p.law_firm_id AS "lawFirmId",
        p.title,
        p.content,
        p.source,
        p.image_url AS "imageUrl",
        p.parent_id AS "parentId",
        p.priority,
        p.rejection_reason AS "rejectionReason",
        p.rejected_at AS "rejectedAt",
        p.modification_request_comment AS "modificationRequestComment",
        p.platforms,
        p.status,
        p.scheduled_at AS "scheduledAt",
        p.published_at AS "publishedAt",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.approval_required AS "approvalRequired",
        p.hashtags,
        p.location,
        p.media_ids AS "mediaIds",
        p.target_connections AS "targetConnections",
        p.preview,
        u.full_name AS "authorName",
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', pp.id,
                'provider', pp.provider,
                'status', pp.status,
                'externalPostId', pp.external_post_id,
                'publishedUrl', pp.published_url,
                'publishedAt', pp.published_at,
                'deletedAt', pp.deleted_at,
                'errorMessage', COALESCE(pp.deletion_error_message, pp.error_message),
                'accountName', sc.account_name,
                'accountHandle', sc.account_handle,
                'canDelete',
                  CASE
                    WHEN pp.provider = 'linkedin'
                      AND pp.status IN ('published', 'delete_failed')
                      AND pp.external_post_id IS NOT NULL
                      AND pp.deleted_at IS NULL
                    THEN TRUE
                    ELSE FALSE
                  END
              )
              ORDER BY pp.created_at DESC
            )
            FROM post_publications pp
            LEFT JOIN social_connections sc ON sc.id = pp.social_connection_id
            WHERE pp.post_id = p.id
          ),
          '[]'::jsonb
        ) AS publications
      FROM posts p
      INNER JOIN users u ON u.id = p.author_id
      WHERE p.organization_id = $1
      ORDER BY p.updated_at DESC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
postsRouter.post("/", async (request, response) => {
    const input = parseOrRespond(postSchema, request.body, response);
    if (!input)
        return;
    const resolvedTitle = buildPostTitle(input.title, input.content);
    const preview = buildPreviewPayload(resolvedTitle, input.content, input.platforms);
    const result = await pool.query(`
      INSERT INTO posts (
        organization_id,
        author_id,
        law_firm_id,
        title,
        content,
        source,
        image_url,
        platforms,
        status,
        scheduled_at,
        media_ids,
        preview,
        approval_required,
        hashtags,
        location,
        target_connections,
        parent_id,
        priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11::jsonb, $12::jsonb, $13, $14::jsonb, $15, $16::jsonb, $17, $18)
      RETURNING
        id,
        law_firm_id AS "lawFirmId",
        title,
        content,
        source,
        image_url AS "imageUrl",
        parent_id AS "parentId",
        priority,
        platforms,
        status,
        scheduled_at AS "scheduledAt",
        published_at AS "publishedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        approval_required AS "approvalRequired",
        hashtags,
        location,
        target_connections AS "targetConnections",
        media_ids AS "mediaIds",
        preview,
        rejection_reason AS "rejectionReason",
        rejected_at AS "rejectedAt",
        modification_request_comment AS "modificationRequestComment"
    `, [
        request.user.organizationId,
        request.user.id,
        input.lawFirmId ?? null,
        resolvedTitle,
        input.content,
        input.source,
        input.imageUrl ?? null,
        JSON.stringify(input.platforms),
        input.status,
        input.scheduledAt ?? null,
        JSON.stringify(input.mediaIds),
        JSON.stringify(preview),
        input.approvalRequired,
        JSON.stringify(input.hashtags),
        input.location,
        JSON.stringify(input.targetConnections),
        input.parentId ?? null,
        input.priority ?? null,
    ]);
    if (input.status === "pending") {
        await ensurePendingApproval({
            postId: result.rows[0].id,
            reviewerId: request.user.id,
            requestedBy: request.user.id,
            comment: "Validation demandee depuis l'editeur.",
        });
    }
    let publicationOutcome = null;
    if (input.status === "approved" && !input.scheduledAt) {
        publicationOutcome = await publishPostToNetworks({
            organizationId: request.user.organizationId,
            post: {
                id: result.rows[0].id,
                title: input.title,
                content: input.content,
                hashtags: input.hashtags,
                platforms: input.platforms,
                targetConnections: input.targetConnections,
            },
            mediaIds: input.mediaIds,
        });
        if (publicationOutcome.successCount > 0) {
            await pool.query(`
          UPDATE posts
          SET status = 'published',
              published_at = NOW(),
              updated_at = NOW()
          WHERE id = $1
        `, [result.rows[0].id]);
            result.rows[0].status = "published";
        }
    }
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: input.status === "pending"
            ? "post_approval_requested"
            : publicationOutcome?.successCount
                ? "post_published"
                : "post_scheduled",
        context: {
            postId: result.rows[0].id,
            title: resolvedTitle,
            status: result.rows[0].status,
            successCount: publicationOutcome?.successCount ?? 0,
            failureCount: publicationOutcome?.failureCount ?? 0,
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId: result.rows[0].id,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.status(201).json({
        ...result.rows[0],
        publicationOutcome,
    });
});
postsRouter.put("/:id", async (request, response) => {
    const input = parseOrRespond(postUpdateSchema, request.body, response);
    if (!input)
        return;
    const currentResult = await pool.query(`
      SELECT
        id,
        law_firm_id AS "lawFirmId",
        title,
        content,
        source,
        image_url AS "imageUrl",
        parent_id AS "parentId",
        priority,
        platforms,
        status,
        scheduled_at AS "scheduledAt",
        approval_required AS "approvalRequired",
        hashtags,
        location,
        media_ids AS "mediaIds",
        target_connections AS "targetConnections",
        rejection_reason AS "rejectionReason",
        modification_request_comment AS "modificationRequestComment"
      FROM posts
      WHERE id = $1 AND organization_id = $2
      LIMIT 1
    `, [request.params.id, request.user.organizationId]);
    const current = currentResult.rows[0];
    if (!current) {
        return response.status(404).json({ message: "Post introuvable." });
    }
    const nextTitle = buildPostTitle(input.title ?? current.title, input.content ?? current.content);
    const nextContent = input.content ?? current.content;
    const nextPlatforms = input.platforms ?? current.platforms;
    const nextStatus = input.status ?? current.status;
    const nextScheduledAt = input.scheduledAt !== undefined ? input.scheduledAt : current.scheduledAt;
    const nextPreview = buildPreviewPayload(nextTitle, nextContent, nextPlatforms);
    const assignments = [];
    const params = [];
    const pushAssignment = (field, value, cast = "") => {
        params.push(value);
        assignments.push(`${field} = $${params.length}${cast}`);
    };
    if (input.lawFirmId !== undefined)
        pushAssignment("law_firm_id", input.lawFirmId);
    if (input.title !== undefined || input.content !== undefined)
        pushAssignment("title", nextTitle);
    if (input.content !== undefined)
        pushAssignment("content", nextContent);
    if (input.source !== undefined)
        pushAssignment("source", input.source);
    if (input.imageUrl !== undefined)
        pushAssignment("image_url", input.imageUrl);
    if (input.parentId !== undefined)
        pushAssignment("parent_id", input.parentId);
    if (input.priority !== undefined)
        pushAssignment("priority", input.priority);
    if (input.platforms !== undefined)
        pushAssignment("platforms", JSON.stringify(nextPlatforms), "::jsonb");
    if (input.status !== undefined)
        pushAssignment("status", nextStatus);
    if (input.scheduledAt !== undefined)
        pushAssignment("scheduled_at", nextScheduledAt);
    if (input.approvalRequired !== undefined)
        pushAssignment("approval_required", input.approvalRequired);
    if (input.hashtags !== undefined)
        pushAssignment("hashtags", JSON.stringify(input.hashtags), "::jsonb");
    if (input.location !== undefined)
        pushAssignment("location", input.location);
    if (input.mediaIds !== undefined)
        pushAssignment("media_ids", JSON.stringify(input.mediaIds), "::jsonb");
    if (input.targetConnections !== undefined)
        pushAssignment("target_connections", JSON.stringify(input.targetConnections), "::jsonb");
    if (input.rejectionReason !== undefined)
        pushAssignment("rejection_reason", input.rejectionReason);
    if (input.status === "rejected")
        assignments.push("rejected_at = NOW()");
    if (input.modificationRequestComment !== undefined)
        pushAssignment("modification_request_comment", input.modificationRequestComment);
    if (input.title !== undefined || input.content !== undefined || input.platforms !== undefined) {
        pushAssignment("preview", JSON.stringify(nextPreview), "::jsonb");
    }
    if (input.status !== undefined && input.status !== "rejected" && input.rejectionReason === undefined) {
        pushAssignment("rejection_reason", null);
        pushAssignment("rejected_at", null);
    }
    if (input.status !== undefined && input.status !== "draft" && input.modificationRequestComment === undefined) {
        pushAssignment("modification_request_comment", null);
    }
    assignments.push("updated_at = NOW()");
    params.push(request.params.id, request.user.organizationId);
    const updatedResult = await pool.query(`
      UPDATE posts
      SET ${assignments.join(", ")}
      WHERE id = $${params.length - 1} AND organization_id = $${params.length}
      RETURNING
        id,
        law_firm_id AS "lawFirmId",
        title,
        content,
        source,
        image_url AS "imageUrl",
        parent_id AS "parentId",
        priority,
        platforms,
        status,
        scheduled_at AS "scheduledAt",
        published_at AS "publishedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        approval_required AS "approvalRequired",
        hashtags,
        location,
        media_ids AS "mediaIds",
        target_connections AS "targetConnections",
        preview,
        rejection_reason AS "rejectionReason",
        rejected_at AS "rejectedAt",
        modification_request_comment AS "modificationRequestComment"
    `, params);
    if (nextStatus === "pending") {
        await ensurePendingApproval({
            postId: request.params.id,
            reviewerId: request.user.id,
            requestedBy: request.user.id,
            comment: "Validation demandee depuis l'editeur.",
        });
    }
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: input.modificationRequestComment !== undefined
            ? "post_modification_requested"
            : nextStatus === "pending"
                ? "post_approval_requested"
                : "post_updated",
        context: {
            postId: request.params.id,
            previousStatus: current.status,
            newStatus: nextStatus,
            comment: input.modificationRequestComment ?? input.rejectionReason ?? null,
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId: request.params.id,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.json(updatedResult.rows[0]);
});
postsRouter.delete("/:id", async (request, response) => {
    const existing = await pool.query(`
      SELECT id, title
      FROM posts
      WHERE id = $1 AND organization_id = $2
      LIMIT 1
    `, [request.params.id, request.user.organizationId]);
    if (!existing.rowCount) {
        return response.status(404).json({ message: "Post introuvable." });
    }
    await deleteWorkflowArtifacts({
        organizationId: request.user.organizationId,
        postId: request.params.id,
    });
    await pool.query(`
      DELETE FROM posts
      WHERE id = $1 AND organization_id = $2
    `, [request.params.id, request.user.organizationId]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "post_deleted",
        context: {
            postId: request.params.id,
            title: existing.rows[0].title,
        },
    });
    return response.json({ success: true });
});
postsRouter.put("/:id/request-modification", requireRole(["admin", "reader", "lawyer"]), async (request, response) => {
    const input = parseOrRespond(decisionSchema, request.body, response);
    if (!input)
        return;
    const postId = request.params.id.toString();
    await pool.query(`
      UPDATE posts
      SET status = 'draft',
          modification_request_comment = $3,
          rejection_reason = NULL,
          rejected_at = NULL,
          updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
    `, [postId, request.user.organizationId, input.comment]);
    await pool.query(`
      UPDATE post_approvals
      SET status = 'rejected',
          reviewer_id = $2,
          comment = $3,
          decided_at = NOW()
      WHERE post_id = $1 AND status = 'pending'
    `, [postId, request.user.id, input.comment]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "post_modification_requested",
        context: {
            postId,
            comment: input.comment,
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.json({ success: true });
});
postsRouter.get("/:id/audit", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        actor_user_id AS "userId",
        event_key AS "eventKey",
        context,
        created_at AS "createdAt"
      FROM activity_logs
      WHERE organization_id = $1
        AND context->>'postId' = $2
        AND event_key = ANY($3::text[])
      ORDER BY created_at DESC
    `, [
        request.user.organizationId,
        request.params.id,
        [
            "post_approval_requested",
            "post_approved",
            "post_rejected",
            "post_modification_requested",
            "post_published",
            "scheduled_post_published",
            "post_updated",
            "post_deleted",
        ],
    ]);
    return response.json(result.rows.map((row) => {
        const mapped = mapAuditEvent(row.eventKey);
        return {
            id: row.id,
            publication_id: request.params.id,
            user_id: row.userId,
            action: mapped.action,
            previous_status: typeof row.context?.previousStatus === "string" ? row.context.previousStatus : null,
            new_status: mapped.newStatus ??
                (typeof row.context?.newStatus === "string" ? row.context.newStatus : null),
            comment: typeof row.context?.comment === "string" ? row.context.comment : null,
            metadata: row.context ?? {},
            created_at: row.createdAt,
        };
    }));
});
postsRouter.post("/preview", async (request, response) => {
    const input = parseOrRespond(previewSchema, request.body, response);
    if (!input)
        return;
    return response.json({
        preview: {
            headline: input.title,
            excerpt: input.content.slice(0, 180),
            characterCount: input.content.length,
            suggestions: [
                "Ajoute un CTA plus direct sur la derniere ligne.",
                "Le hashtag principal peut etre deplace dans la premiere moitie du post.",
                "Prevois une variante plus courte pour Facebook ou LinkedIn si le message est trop dense.",
            ],
            platformCards: input.platforms.map((platform) => ({
                platform,
                title: input.title,
                body: input.content.slice(0, platform === "facebook" ? 400 : platform === "instagram" ? 2200 : 320),
            })),
        },
    });
});
postsRouter.post("/:id/publish-now", requireRole(["admin", "editor"]), async (request, response) => {
    const postResult = await pool.query(`
        SELECT
          id,
          title,
          content,
          hashtags,
          platforms,
          target_connections AS "targetConnections",
          media_ids AS "mediaIds"
        FROM posts
        WHERE id = $1 AND organization_id = $2
      `, [request.params.id, request.user.organizationId]);
    if (!postResult.rowCount) {
        return response.status(404).json({ message: "Post introuvable." });
    }
    const post = postResult.rows[0];
    const publicationOutcome = await publishPostToNetworks({
        organizationId: request.user.organizationId,
        post,
        mediaIds: post.mediaIds,
    });
    if (!publicationOutcome.successCount) {
        return response.status(422).json({
            message: publicationOutcome.attempts[0]?.errorMessage ??
                "Aucune publication n'a pu etre envoyee.",
            publicationOutcome,
        });
    }
    await pool.query(`
        UPDATE posts
        SET status = 'published',
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [post.id]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "post_published",
        context: {
            postId: post.id,
            successCount: publicationOutcome.successCount,
            failureCount: publicationOutcome.failureCount,
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId: post.id,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.json({
        success: true,
        publicationOutcome,
    });
});
postsRouter.delete("/:id/publications/:publicationId", requireRole(["admin", "editor"]), async (request, response) => {
    const publicationResult = await pool.query(`
        SELECT
          pp.id,
          pp.provider,
          pp.status,
          pp.external_post_id AS "externalPostId",
          pp.deleted_at AS "deletedAt",
          pp.social_connection_id AS "socialConnectionId",
          sc.organization_id AS "organizationId",
          sc.integration_id AS "integrationId",
          sc.provider AS "connectionProvider",
          sc.account_id AS "accountId",
          sc.account_name AS "accountName",
          sc.account_handle AS "accountHandle",
          sc.account_type AS "accountType",
          sc.avatar_url AS "avatarUrl",
          sc.access_token AS "accessTokenEncrypted",
          sc.refresh_token AS "refreshTokenEncrypted",
          sc.token_expires_at AS "tokenExpiresAt",
          sc.scopes,
          sc.metadata,
          sc.status AS "connectionStatus"
        FROM post_publications pp
        LEFT JOIN social_connections sc ON sc.id = pp.social_connection_id
        WHERE pp.organization_id = $1
          AND pp.post_id = $2
          AND pp.id = $3
      `, [
        request.user.organizationId,
        request.params.id,
        request.params.publicationId,
    ]);
    if (!publicationResult.rowCount) {
        return response.status(404).json({ message: "Publication introuvable." });
    }
    const publication = publicationResult.rows[0];
    if (publication.deletedAt || publication.status === "deleted") {
        return response.json({
            success: true,
            alreadyDeleted: true,
            message: "Cette publication n'est deja plus visible sur le reseau.",
        });
    }
    if (!publication.externalPostId) {
        return response.status(422).json({
            message: "Aucun identifiant reseau n'est disponible pour supprimer ce contenu.",
        });
    }
    if (!publication.socialConnectionId ||
        !publication.connectionProvider ||
        !publication.organizationId ||
        !publication.accountId ||
        !publication.accountName ||
        !publication.accountHandle ||
        !publication.accountType ||
        !publication.accessTokenEncrypted) {
        return response.status(409).json({
            message: "Le compte social relie n'est plus disponible pour retirer cette publication.",
        });
    }
    const supportedProviders = ["linkedin", "facebook", "instagram", "youtube"];
    if (!supportedProviders.includes(publication.connectionProvider)) {
        return response.status(422).json({
            message: "Le fournisseur de cette publication n'est pas supporte.",
        });
    }
    const storedConnection = {
        id: publication.socialConnectionId,
        organizationId: publication.organizationId,
        integrationId: publication.integrationId,
        provider: publication.connectionProvider,
        accountId: publication.accountId,
        accountName: publication.accountName,
        accountHandle: publication.accountHandle,
        accountType: publication.accountType,
        avatarUrl: publication.avatarUrl,
        accessToken: decryptSensitiveValue(publication.accessTokenEncrypted) ?? "",
        refreshToken: decryptSensitiveValue(publication.refreshTokenEncrypted),
        tokenExpiresAt: publication.tokenExpiresAt,
        scopes: publication.scopes ?? [],
        metadata: publication.metadata ?? {},
        status: publication.connectionStatus ?? "active",
    };
    if (!storedConnection.accessToken) {
        return response.status(409).json({
            message: "Le token de connexion n'est plus disponible. Reconnectez LinkedIn avant de retirer ce post.",
        });
    }
    try {
        const deletionResult = await deleteViaProvider({
            connection: storedConnection,
            externalPostId: publication.externalPostId,
        });
        if (deletionResult.refreshedCredentials) {
            await pool.query(`
            UPDATE social_connections
            SET access_token = $2,
                refresh_token = $3,
                token_expires_at = $4,
                updated_at = NOW()
            WHERE id = $1
          `, [
                storedConnection.id,
                encryptSensitiveValue(deletionResult.refreshedCredentials.accessToken),
                deletionResult.refreshedCredentials.refreshToken
                    ? encryptSensitiveValue(deletionResult.refreshedCredentials.refreshToken)
                    : null,
                deletionResult.refreshedCredentials.tokenExpiresAt,
            ]);
        }
        await pool.query(`
          UPDATE post_publications
          SET status = 'deleted',
              deleted_at = NOW(),
              deleted_by = $3,
              deletion_error_message = NULL,
              response_data = response_data || $4::jsonb,
              updated_at = NOW()
          WHERE id = $1
            AND organization_id = $2
        `, [
            publication.id,
            request.user.organizationId,
            request.user.id,
            JSON.stringify({
                deletion: {
                    provider: deletionResult.provider,
                    deletedAt: new Date().toISOString(),
                    ...deletionResult.responseData,
                },
            }),
        ]);
        await logEvent({
            organizationId: request.user.organizationId,
            actorUserId: request.user.id,
            eventKey: "post_publication_deleted",
            context: {
                postId: request.params.id,
                publicationId: publication.id,
                provider: publication.provider,
                externalPostId: publication.externalPostId,
            },
        });
        return response.json({
            success: true,
            message: "Publication retiree du reseau avec succes.",
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Suppression impossible.";
        await pool.query(`
          UPDATE post_publications
          SET status = 'delete_failed',
              deletion_error_message = $3,
              updated_at = NOW()
          WHERE id = $1
            AND organization_id = $2
        `, [publication.id, request.user.organizationId, errorMessage]);
        return response.status(422).json({
            message: errorMessage,
        });
    }
});
postsRouter.get("/pending", async (request, response) => {
    const result = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.content,
        p.platforms,
        p.status,
        p.scheduled_at AS "scheduledAt",
        u.full_name AS "authorName",
        pa.comment,
        pa.created_at AS "requestedAt"
      FROM posts p
      INNER JOIN users u ON u.id = p.author_id
      LEFT JOIN post_approvals pa ON pa.post_id = p.id AND pa.status = 'pending'
      WHERE p.organization_id = $1 AND p.status = 'pending'
      ORDER BY p.updated_at DESC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
postsRouter.put("/:id/approve", requireRole(["admin", "reader", "lawyer"]), async (request, response) => {
    const input = parseOrRespond(decisionSchema, request.body, response);
    if (!input)
        return;
    const postId = request.params.id.toString();
    const approvalResult = await pool.query(`
        UPDATE posts
        SET status = CASE
              WHEN scheduled_at IS NOT NULL THEN 'scheduled'
              ELSE 'approved'
            END,
            modification_request_comment = NULL,
            rejection_reason = NULL,
            rejected_at = NULL,
            updated_at = NOW()
        WHERE id = $1 AND organization_id = $2
        RETURNING status
      `, [postId, request.user.organizationId]);
    await pool.query(`
        UPDATE post_approvals
        SET status = 'approved',
            reviewer_id = $2,
            comment = $3,
            decided_at = NOW()
        WHERE post_id = $1 AND status = 'pending'
      `, [postId, request.user.id, input.comment]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "post_approved",
        context: {
            postId,
            comment: input.comment,
            newStatus: approvalResult.rows[0]?.status ?? "approved",
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.json({ success: true });
});
postsRouter.put("/:id/reject", requireRole(["admin", "reader", "lawyer"]), async (request, response) => {
    const input = parseOrRespond(decisionSchema, request.body, response);
    if (!input)
        return;
    const postId = request.params.id.toString();
    await pool.query(`
        UPDATE posts
        SET status = 'rejected',
            rejection_reason = $3,
            rejected_at = NOW(),
            modification_request_comment = NULL,
            updated_at = NOW()
        WHERE id = $1 AND organization_id = $2
      `, [postId, request.user.organizationId, input.comment]);
    await pool.query(`
        UPDATE post_approvals
        SET status = 'rejected',
            reviewer_id = $2,
            comment = $3,
            decided_at = NOW()
        WHERE post_id = $1 AND status = 'pending'
      `, [postId, request.user.id, input.comment]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "post_rejected",
        context: {
            postId,
            comment: input.comment,
            newStatus: "refused",
        },
    });
    const workflowSnapshot = await loadPostWorkflowSnapshot({
        organizationId: request.user.organizationId,
        postId,
    });
    if (workflowSnapshot) {
        await syncPostWorkflowArtifacts(workflowSnapshot);
    }
    return response.json({ success: true });
});
