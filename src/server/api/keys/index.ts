import { ApiKey, genId } from "@/schema/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const apiKeyRouter = createTRPCRouter({
  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        name: ApiKey.name,
        id: ApiKey.id,
        createdAt: ApiKey.createdAt,
      })
      .from(ApiKey)
      .where(eq(ApiKey.userId, ctx.user.id))
      .orderBy(desc(ApiKey.createdAt));
  }),
  createApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    const existingKeys = await ctx.db
      .select({ name: ApiKey.name })
      .from(ApiKey)
      .where(eq(ApiKey.userId, ctx.user.id));

    const keyName = `Key ${existingKeys.length + 1}`;

    const apiKey = genId.apiKey();
    await ctx.db.insert(ApiKey).values({
      userId: ctx.user.id,
      id: apiKey,
      name: keyName,
    });
    return apiKey;
  }),
  deleteApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(ApiKey)
        .where(
          and(eq(ApiKey.userId, ctx.user.id), eq(ApiKey.id, input.apiKey))
        );
    }),
  updateApiKeyName: protectedProcedure
    .input(z.object({ apiKey: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(ApiKey)
        .set({ name: input.name })
        .where(
          and(eq(ApiKey.userId, ctx.user.id), eq(ApiKey.id, input.apiKey))
        );
    }),
});
