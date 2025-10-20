/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import type { NextRequest } from "next/server";
import { initTRPC, TRPCError } from "@trpc/server";
import type { Session, User } from "lucia";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/schema/db";
import { validateRequest } from "../auth";
import { getPosthog } from "../posthog";

export const createTRPCContext = (opts: { req: NextRequest }) => {
  // Fetch stuff that depends on the request
  return {
    posthog: getPosthog(),
    db: db,
    headers: opts.req.headers,
    req: opts.req,
    user: null as User | null,
    session: null as Session | null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const useUserAuth = t.middleware(async ({ ctx, next }) => {
  const { user, session } = await validateRequest();
  return next({
    ctx: {
      // infers the `session` as non-nullable
      ...ctx,
      user,
      session,
    },
  });
});

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.userId || ctx.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

const loggerMiddleware = t.middleware(async ({ next, ctx }) => {
  const result = await next({ ctx });
  await ctx.posthog?.shutdownAsync();
  return result;
});

export const createTRPCRouter = t.router;
export const publicAuthlessProcedure = t.procedure;
export const publicProcedure = t.procedure
  .use(loggerMiddleware)
  .use(useUserAuth);
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(useUserAuth)
  .use(enforceUserIsAuthed);
