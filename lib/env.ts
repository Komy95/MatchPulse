import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalBooleanString = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const baseEnvSchema = z.object({
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_FIREBASE_API_KEY: optionalString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optionalString,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_USE_EMULATORS: optionalBooleanString,
  GOOGLE_CLOUD_PROJECT: optionalString,
  FIREBASE_PROJECT_ID: optionalString,
  OPENAI_API_KEY: optionalString,
  OPENAI_INSIGHT_MODEL: optionalString,
  SPORTS_PROVIDER: z
    .enum(["mock", "sportmonks", "api-football", "football-data-org"])
    .default("mock"),
  SPORTS_PROVIDER_API_KEY: optionalString,
  CRON_SECRET: optionalString,
  SIM_DEFAULT_RUNS: z.coerce.number().int().positive().default(10000),
  PUBLIC_SIM_RUNS: z.coerce.number().int().positive().default(100000),
  LIVE_CACHE_TTL_SEC: z.coerce.number().int().positive().default(15),
  INSIGHT_CACHE_TTL_SEC: z.coerce.number().int().positive().default(3600),
  PUBLIC_SIM_CACHE_TTL_SEC: z.coerce.number().int().positive().default(86400),
  AD_PROVIDER: z.string().default("adsense"),
  CONSENT_MODE: z.string().default("strict"),
});

const requiredFirebaseClientEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
] as const;

const envSchema = baseEnvSchema.superRefine((value, context) => {
  for (const key of requiredFirebaseClientEnvVars) {
    if (!value[key]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} is required for Firebase client initialization.`,
      });
    }
  }

  if (value.APP_ENV !== "local" && !value.FIREBASE_PROJECT_ID && !value.GOOGLE_CLOUD_PROJECT) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["FIREBASE_PROJECT_ID"],
      message: "FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is required outside local development.",
    });
  }

  if (value.SPORTS_PROVIDER !== "mock" && !value.SPORTS_PROVIDER_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SPORTS_PROVIDER_API_KEY"],
      message: "SPORTS_PROVIDER_API_KEY is required when a real sports provider is configured.",
    });
  }
});

const rawEnv = {
  APP_ENV: process.env.APP_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_USE_EMULATORS: process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS,
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_INSIGHT_MODEL: process.env.OPENAI_INSIGHT_MODEL,
  SPORTS_PROVIDER: process.env.SPORTS_PROVIDER,
  SPORTS_PROVIDER_API_KEY: process.env.SPORTS_PROVIDER_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  SIM_DEFAULT_RUNS: process.env.SIM_DEFAULT_RUNS,
  PUBLIC_SIM_RUNS: process.env.PUBLIC_SIM_RUNS,
  LIVE_CACHE_TTL_SEC: process.env.LIVE_CACHE_TTL_SEC,
  INSIGHT_CACHE_TTL_SEC: process.env.INSIGHT_CACHE_TTL_SEC,
  PUBLIC_SIM_CACHE_TTL_SEC: process.env.PUBLIC_SIM_CACHE_TTL_SEC,
  AD_PROVIDER: process.env.AD_PROVIDER,
  CONSENT_MODE: process.env.CONSENT_MODE,
};

export const env = envSchema.parse(rawEnv);

export function getFirebaseClientConfig() {
  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
}

export function getFirebaseProjectId() {
  const projectId =
    env.FIREBASE_PROJECT_ID ??
    env.GOOGLE_CLOUD_PROJECT ??
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Firebase project ID is required.");
  }

  return projectId;
}
