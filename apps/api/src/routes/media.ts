import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { logEvent } from "../lib/logs.js";
import { buildPublicFileUrl, buildStoredFileName, ensureOrganizationUploadDir, } from "../lib/storage.js";
import { requireAuth } from "../middleware/auth.js";
const mediaSchema = z.object({
    folder: z.string().min(2),
    name: z.string().min(2),
    type: z.enum(["image", "video", "audio"]),
    format: z.string().min(2),
    sizeBytes: z.coerce.number().positive(),
    url: z.string().url(),
    thumbnailUrl: z.string().url(),
    tags: z.array(z.string()).default([]),
    rights: z.string().min(2),
});
const mediaUploadSchema = z.object({
    folder: z.string().min(2).default("Uploads"),
    name: z.string().min(2).optional(),
    rights: z.string().min(2).default("internal"),
    tags: z.string().optional().default(""),
});
const upload = multer({
    storage: multer.diskStorage({
        destination: (request, _file, callback) => {
            callback(null, ensureOrganizationUploadDir(request.user.organizationId));
        },
        filename: (_request, file, callback) => {
            callback(null, buildStoredFileName(file.originalname));
        },
    }),
    limits: {
        fileSize: 25 * 1024 * 1024,
    },
    fileFilter: (_request, file, callback) => {
        const majorType = file.mimetype.split("/")[0];
        if (["image", "video", "audio"].includes(majorType)) {
            callback(null, true);
            return;
        }
        callback(new Error("Seuls les fichiers image, video et audio sont acceptes."));
    },
});
export const mediaRouter = Router();
mediaRouter.use(requireAuth);
mediaRouter.get("/", async (request, response) => {
    const result = await pool.query(`
      SELECT
        id,
        folder,
        name,
        type,
        format,
        size_bytes AS "sizeBytes",
        url,
        thumbnail_url AS "thumbnailUrl",
        tags,
        rights,
        author_name AS "authorName",
        usage_count AS "usageCount",
        created_at AS "createdAt"
      FROM media_items
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `, [request.user.organizationId]);
    return response.json(result.rows);
});
mediaRouter.post("/upload", upload.single("file"), async (request, response) => {
    if (!request.file) {
        return response.status(400).json({ message: "Aucun fichier n'a ete transmis." });
    }
    const input = mediaUploadSchema.parse(request.body);
    const fileType = request.file.mimetype.split("/")[0];
    const mediaType = (["image", "video", "audio"].includes(fileType)
        ? fileType
        : "image");
    const publicPath = `/uploads/${request.user.organizationId}/${request.file.filename}`;
    const fileUrl = buildPublicFileUrl(request, publicPath);
    const tags = input.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    const result = await pool.query(`
      INSERT INTO media_items (
        organization_id,
        folder,
        name,
        type,
        format,
        size_bytes,
        url,
        thumbnail_url,
        tags,
        rights,
        author_name,
        usage_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, 0)
      RETURNING
        id,
        folder,
        name,
        type,
        format,
        size_bytes AS "sizeBytes",
        url,
        thumbnail_url AS "thumbnailUrl",
        tags,
        rights,
        author_name AS "authorName",
        usage_count AS "usageCount",
        created_at AS "createdAt"
    `, [
        request.user.organizationId,
        input.folder,
        input.name ?? request.file.originalname,
        mediaType,
        request.file.originalname.split(".").pop()?.toUpperCase() ?? request.file.mimetype,
        request.file.size,
        fileUrl,
        fileUrl,
        JSON.stringify(tags),
        input.rights,
        request.user.fullName,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "media_uploaded",
        context: {
            name: input.name ?? request.file.originalname,
            folder: input.folder,
            source: "local_upload",
        },
    });
    return response.status(201).json(result.rows[0]);
});
mediaRouter.post("/", async (request, response) => {
    const input = mediaSchema.parse(request.body);
    const result = await pool.query(`
      INSERT INTO media_items (
        organization_id,
        folder,
        name,
        type,
        format,
        size_bytes,
        url,
        thumbnail_url,
        tags,
        rights,
        author_name,
        usage_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, 0)
      RETURNING
        id,
        folder,
        name,
        type,
        format,
        size_bytes AS "sizeBytes",
        url,
        thumbnail_url AS "thumbnailUrl",
        tags,
        rights,
        author_name AS "authorName",
        usage_count AS "usageCount",
        created_at AS "createdAt"
    `, [
        request.user.organizationId,
        input.folder,
        input.name,
        input.type,
        input.format,
        input.sizeBytes,
        input.url,
        input.thumbnailUrl,
        JSON.stringify(input.tags),
        input.rights,
        request.user.fullName,
    ]);
    await logEvent({
        organizationId: request.user.organizationId,
        actorUserId: request.user.id,
        eventKey: "media_uploaded",
        context: { name: input.name, folder: input.folder, source: "remote_url" },
    });
    return response.status(201).json(result.rows[0]);
});
