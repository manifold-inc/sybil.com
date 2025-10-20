import { env } from "@/env.mjs";
import { PostHog } from "posthog-node";

export const getPosthog = () => {
  return new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
};
