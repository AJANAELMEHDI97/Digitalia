import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";
config();
const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z
        .string()
        .default("postgresql://socialpulse:socialpulse@localhost:5432/socialpulse"),
    JWT_SECRET: z.string().default("socialpulse-dev-secret"),
    SOCIAL_TOKEN_SECRET: z.string().default("socialpulse-social-secret"),
    ENABLE_LINKEDIN_PUBLISHING: z
        .string()
        .default("false")
        .transform((value) => value.toLowerCase() === "true"),
    FRONTEND_URL: z.string().default("http://localhost:8080"),
    API_PUBLIC_URL: z.string().default(""),
    UPLOADS_DIR: z.string().default(resolve(process.cwd(), "uploads")),
    LINKEDIN_CLIENT_ID: z.string().default(""),
    LINKEDIN_CLIENT_SECRET: z.string().default(""),
    LINKEDIN_REDIRECT_URI: z.string().default(""),
    META_CLIENT_ID: z.string().default(""),
    META_CLIENT_SECRET: z.string().default(""),
    META_REDIRECT_URI: z.string().default(""),
    META_FACEBOOK_REDIRECT_URI: z.string().default(""),
    META_INSTAGRAM_REDIRECT_URI: z.string().default(""),
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    GOOGLE_REDIRECT_URI: z.string().default(""),
});
export const env = envSchema.parse(process.env);
