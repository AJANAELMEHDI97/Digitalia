import { pool } from "../db/pool.js";
const WORKFLOW_SOURCE = "workflow-post";
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);
const formatPlatforms = (platforms) => platforms.length > 1 ? platforms.join(", ") : platforms[0] ?? "multi";
const buildMetadata = (postId, stage) => ({
    source: WORKFLOW_SOURCE,
    postId,
    stage,
});
const deleteExistingWorkflowArtifacts = async ({ organizationId, postId, }) => {
    await Promise.all([
        pool.query(`
        DELETE FROM notifications
        WHERE organization_id = $1
          AND metadata->>'source' = $2
          AND metadata->>'postId' = $3
      `, [organizationId, WORKFLOW_SOURCE, postId]),
        pool.query(`
        DELETE FROM calendar_events
        WHERE organization_id = $1
          AND metadata->>'source' = $2
          AND metadata->>'postId' = $3
      `, [organizationId, WORKFLOW_SOURCE, postId]),
    ]);
};
const createNotification = async (input) => {
    await pool.query(`
      INSERT INTO notifications (
        organization_id,
        user_id,
        type,
        title,
        body,
        priority,
        action_url,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    `, [
        input.organizationId,
        input.userId,
        input.type,
        input.title,
        input.body,
        input.priority,
        input.actionUrl,
        JSON.stringify(input.metadata),
    ]);
};
const createCalendarEvent = async (input) => {
    await pool.query(`
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
        timezone,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Africa/Casablanca', $10::jsonb)
    `, [
        input.organizationId,
        input.title,
        input.description,
        input.startAt,
        input.endAt,
        input.type,
        input.status,
        input.platform,
        input.assignedUserId,
        JSON.stringify(input.metadata),
    ]);
};
const getAdminUserIds = async (organizationId) => {
    const result = await pool.query(`
      SELECT id
      FROM users
      WHERE organization_id = $1
        AND role = 'admin'
      ORDER BY created_at ASC
    `, [organizationId]);
    return result.rows.map((row) => row.id);
};
const buildApprovalWindow = (scheduledAt) => {
    const now = new Date();
    if (scheduledAt) {
        const scheduledDate = new Date(scheduledAt);
        const proposedStart = addMinutes(scheduledDate, -120);
        if (proposedStart.getTime() > now.getTime()) {
            return {
                startAt: proposedStart,
                endAt: addMinutes(proposedStart, 30),
            };
        }
    }
    const startAt = addMinutes(now, 30);
    return {
        startAt,
        endAt: addMinutes(startAt, 30),
    };
};
export const syncPostWorkflowArtifacts = async (post) => {
    await deleteExistingWorkflowArtifacts({
        organizationId: post.organizationId,
        postId: post.id,
    });
    const platformLabel = formatPlatforms(post.platforms);
    if (post.status === "pending") {
        const adminUserIds = await getAdminUserIds(post.organizationId);
        const approvalWindow = buildApprovalWindow(post.scheduledAt);
        await Promise.all(adminUserIds.map((adminUserId) => createNotification({
            organizationId: post.organizationId,
            userId: adminUserId,
            type: "approval",
            title: `Validation requise : ${post.title}`,
            body: `Un contenu attend une validation avant diffusion sur ${platformLabel}.`,
            priority: "high",
            actionUrl: "/app/approvals",
            metadata: buildMetadata(post.id, "pending"),
        })));
        await createCalendarEvent({
            organizationId: post.organizationId,
            assignedUserId: adminUserIds[0] ?? null,
            title: `Validation - ${post.title}`,
            description: `Validation demandee avant diffusion sur ${platformLabel}.`,
            startAt: approvalWindow.startAt,
            endAt: approvalWindow.endAt,
            type: "approval",
            status: "pending",
            platform: post.platforms.length > 1 ? "multi" : platformLabel,
            metadata: buildMetadata(post.id, "pending"),
        });
        return;
    }
    if (post.status === "scheduled" && post.scheduledAt) {
        const scheduledDate = new Date(post.scheduledAt);
        await Promise.all([
            createNotification({
                organizationId: post.organizationId,
                userId: post.authorId,
                type: "publishing",
                title: `Post programme : ${post.title}`,
                body: `La publication est programmee sur ${platformLabel}.`,
                priority: "medium",
                actionUrl: "/app/calendar",
                metadata: buildMetadata(post.id, "scheduled"),
            }),
            createCalendarEvent({
                organizationId: post.organizationId,
                assignedUserId: post.authorId,
                title: `Publication - ${post.title}`,
                description: `Publication programmee sur ${platformLabel}.`,
                startAt: scheduledDate,
                endAt: addMinutes(scheduledDate, 30),
                type: "post",
                status: "scheduled",
                platform: post.platforms.length > 1 ? "multi" : platformLabel,
                metadata: buildMetadata(post.id, "scheduled"),
            }),
        ]);
        return;
    }
    if (post.status === "approved") {
        await createNotification({
            organizationId: post.organizationId,
            userId: post.authorId,
            type: "approval",
            title: `Post approuve : ${post.title}`,
            body: `Le contenu est approuve et pret a etre publie sur ${platformLabel}.`,
            priority: "medium",
            actionUrl: "/app/editor",
            metadata: buildMetadata(post.id, "approved"),
        });
        return;
    }
    if (post.status === "rejected") {
        await createNotification({
            organizationId: post.organizationId,
            userId: post.authorId,
            type: "approval",
            title: `Post a retravailler : ${post.title}`,
            body: "Le contenu a ete rejete et doit etre ajuste avant une nouvelle soumission.",
            priority: "high",
            actionUrl: "/app/approvals",
            metadata: buildMetadata(post.id, "rejected"),
        });
        return;
    }
    if (post.status === "published") {
        const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
        await Promise.all([
            createNotification({
                organizationId: post.organizationId,
                userId: post.authorId,
                type: "publishing",
                title: `Post publie : ${post.title}`,
                body: `La publication est desormais en ligne sur ${platformLabel}.`,
                priority: "low",
                actionUrl: "/app/editor",
                metadata: buildMetadata(post.id, "published"),
            }),
            createCalendarEvent({
                organizationId: post.organizationId,
                assignedUserId: post.authorId,
                title: `Publie - ${post.title}`,
                description: `Publication effectuee sur ${platformLabel}.`,
                startAt: publishedDate,
                endAt: addMinutes(publishedDate, 30),
                type: "post",
                status: "published",
                platform: post.platforms.length > 1 ? "multi" : platformLabel,
                metadata: buildMetadata(post.id, "published"),
            }),
        ]);
    }
};
