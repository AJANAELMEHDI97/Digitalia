import cors from "cors";
import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { exportsRouter } from "./routes/exports.js";
import { normalizeLegacyWorkspaceData } from "./lib/normalize.js";
import { ensureApplicationSchema } from "./lib/schema.js";
import { ensureUploadsDir } from "./lib/storage.js";
import { seedDatabase, ensureEssentialUsers } from "./lib/seed.js";
import { authRouter } from "./routes/auth.js";
import { calendarRouter } from "./routes/calendar.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { integrationsRouter } from "./routes/integrations.js";
import { inboxRouter } from "./routes/inbox.js";
import { mediaRouter } from "./routes/media.js";
import { metricsRouter } from "./routes/metrics.js";
import { notificationsRouter } from "./routes/notifications.js";
import { organizationRouter } from "./routes/organization.js";
import { postsRouter, publishDueScheduledPosts } from "./routes/posts.js";
import { profileRouter } from "./routes/profile.js";
import { rulesRouter } from "./routes/rules.js";
import { trendsRouter } from "./routes/trends.js";
import { adminLogsRouter } from "./routes/adminLogs.js";
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:8080"],
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((request, response, next) => {
    const requestId = randomUUID();
    response.setHeader("X-Request-Id", requestId);
    request.headers["x-request-id"] = requestId;
    next();
});
ensureUploadsDir();
app.use("/uploads", express.static(env.UPLOADS_DIR));
app.use(express.json({ limit: "2mb" }));
app.get("/health", async (_request, response) => {
    const result = await pool.query("SELECT NOW()");
    response.json({
        status: "ok",
        database: result.rows[0],
    });
});
app.get("/", (_request, response) => {
    response.json({
        name: "SocialPulse API",
        status: "online",
        docs: {
            health: "/health",
            auth: "/auth/login",
            dashboard: "/dashboard",
        },
    });
});
app.use("/auth", authRouter);
app.use("/exports", exportsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/calendar", calendarRouter);
app.use("/posts", postsRouter);
app.use("/metrics", metricsRouter);
app.use("/trends", trendsRouter);
app.use("/inbox", inboxRouter);
app.use("/media", mediaRouter);
app.use("/user", profileRouter);
app.use("/organization", organizationRouter);
app.use("/notifications", notificationsRouter);
app.use("/integrations", integrationsRouter);
app.use("/global-rules", rulesRouter);
app.use("/admin/logs", adminLogsRouter);
app.use((_request, response) => {
    return response.status(404).json({
        message: "Route introuvable.",
    });
});
app.use((error, _request, response, _next) => {
    if (error instanceof ZodError) {
        return response.status(400).json({
            message: "Donnees invalides.",
            requestId: response.getHeader("X-Request-Id"),
            issues: error.issues,
        });
    }
    console.error(error);
    return response.status(500).json({
        message: error instanceof Error
            ? error.message
            : "Une erreur interne est survenue.",
        requestId: response.getHeader("X-Request-Id"),
    });
});
const bootstrap = async () => {
    await pool.query("SELECT 1");
    await ensureApplicationSchema();
    await seedDatabase();
    await ensureEssentialUsers();
    await normalizeLegacyWorkspaceData();
    await publishDueScheduledPosts();
    app.listen(env.PORT, () => {
        console.log(`API SocialPulse sur http://localhost:${env.PORT}`);
    });
    setInterval(() => {
        void publishDueScheduledPosts().catch((error) => {
            console.error("Erreur de publication planifiee", error);
        });
    }, 60_000);
};
bootstrap().catch((error) => {
    console.error("Erreur de demarrage API", error);
    process.exit(1);
});
