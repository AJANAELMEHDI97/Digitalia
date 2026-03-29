import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import { env } from "../config/env.js";
export const ensureUploadsDir = () => {
    mkdirSync(env.UPLOADS_DIR, { recursive: true });
};
export const ensureOrganizationUploadDir = (organizationId) => {
    const directory = join(env.UPLOADS_DIR, organizationId);
    mkdirSync(directory, { recursive: true });
    return directory;
};
export const sanitizeFileBaseName = (filename) => {
    const baseName = filename
        .replace(extname(filename), "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return baseName || "media";
};
export const buildStoredFileName = (filename) => {
    const extension = extname(filename).toLowerCase() || ".bin";
    return `${Date.now()}-${sanitizeFileBaseName(filename)}-${randomUUID().slice(0, 8)}${extension}`;
};
export const buildPublicFileUrl = (request, relativePath) => {
    const baseUrl = env.API_PUBLIC_URL || `${request.protocol}://${request.get("host")}`;
    const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
    return `${baseUrl}${normalizedPath}`;
};
