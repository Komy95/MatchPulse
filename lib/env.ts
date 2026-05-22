import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_INSIGHT_MODEL: z.string().optional(),
  SPORTS_PROVIDER: z.string().default("sportmonks"),
  SPORTS_PROVIDER_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  SIM_DEFAULT_RUNS: z.coerce.number().int().positive().default(10000),
  PUBLIC_SIM_RUNS: z.coerce.number().int().positive().default(100000),
  LIVE_CACHE_TTL_SEC: z.coerce.number().int().positive().default(15),
  INSIGHT_CACHE_TTL_SEC: z.coerce.number().int().positive().default(3600),
  PUBLIC_SIM_CACHE_TTL_SEC: z.coerce.number().int().positive().default(86400),
  AD_PROVIDER: z.string().default("adsense"),
  CONSENT_MODE: z.string().default("strict"),
});

export const env = envSchema.parse(process.env);

export function getFirebaseProjectId() {
  return (
    env.FIREBASE_PROJECT_ID ??
    env.GOOGLE_CLOUD_PROJECT ??
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}
