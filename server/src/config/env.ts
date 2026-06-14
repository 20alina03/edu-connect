import "dotenv/config";
import { z } from "zod";

const Schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default(
    "http://localhost:5173,http://localhost:8080,http://localhost:8003,https://ilmrise.com,https://www.ilmrise.com",
  ),
  // Google OAuth (already present)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Brevo — for reminder emails
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@ilmrise.com"),
  EMAIL_FROM_NAME: z.string().default("IlmRise"),
});

const parsed = Schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};