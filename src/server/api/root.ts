import { createTRPCRouter } from "@/server/api/trpc";
import type { inferReactQueryProcedureOptions } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { accountRouter } from "./account";
import { fileRouter } from "./file";
import { apiKeyRouter } from "./keys";
import { modelRouter } from "./model";
import { stripeRouter } from "./stripe";
import { subscriptionPlansRouter } from "./subscriptionPlans";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  file: fileRouter,
  account: accountRouter,
  apiKey: apiKeyRouter,
  stripe: stripeRouter,
  model: modelRouter,
  subscriptionPlans: subscriptionPlansRouter,
});

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// export type definition of API
export type AppRouter = typeof appRouter;
