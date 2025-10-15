import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),

    S3_API_URL: z.string().url(),
    S3_API_KEY: z.string().min(1),
    S3_API_KEY_ID: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string(),
    NEXT_PUBLIC_SEARCH_API: z.string().url(),
    NEXT_PUBLIC_CHAT_API: z.string().url().optional(),
    NEXT_PUBLIC_RELEASE_FLAG: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    NEXT_PUBLIC_SEARCH_API: process.env.NEXT_PUBLIC_SEARCH_API,
    NEXT_PUBLIC_RELEASE_FLAG: process.env.NEXT_PUBLIC_RELEASE_FLAG,
    NEXT_PUBLIC_CHAT_API: process.env.NEXT_PUBLIC_CHAT_API,
    S3_API_KEY: process.env.S3_API_KEY,
    S3_API_URL: process.env.S3_API_URL,
    S3_API_KEY_ID: process.env.S3_API_KEY_ID,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,

    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
