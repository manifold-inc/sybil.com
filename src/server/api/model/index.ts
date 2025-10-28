import { DailyModelStats, Model } from "@/schema/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { and, desc, eq, inArray, or, sql, sum } from "drizzle-orm";
import { z } from "zod";

export const modelRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ limit: z.number().default(16) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 16;
      let whereClause;
      if (ctx.session?.userId) {
        whereClause = and(
          or(
            sql`${Model.allowedUserId} IS NULL`,
            eq(Model.allowedUserId, ctx.session.userId)
          ),
          eq(Model.enabled, true)
        );
      } else {
        whereClause = and(
          sql`${Model.allowedUserId} IS NULL`,
          eq(Model.enabled, true)
        );
      }

      return await ctx.db
        .select({
          id: Model.id,
          name: Model.name,
          description: Model.description,
          modality: Model.modality,
          enabled: Model.enabled,
          allowedUserId: Model.allowedUserId,
        })
        .from(Model)
        .where(whereClause)
        .orderBy(desc(Model.createdAt))
        .limit(limit);
    }),

  getAllByPagination: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().default(16),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      let whereClause;
      if (ctx.session?.userId) {
        whereClause = and(
          or(
            sql`${Model.allowedUserId} IS NULL`,
            eq(Model.allowedUserId, ctx.session.userId)
          ),
          eq(Model.enabled, true)
        );
      } else {
        whereClause = and(
          sql`${Model.allowedUserId} IS NULL`,
          eq(Model.enabled, true)
        );
      }

      const models = await ctx.db
        .select({
          id: Model.id,
          name: Model.name,
          description: Model.description,
          modality: Model.modality,
          enabled: Model.enabled,
        })
        .from(Model)
        .where(whereClause)
        .orderBy(desc(Model.createdAt))
        .limit(limit)
        .offset(offset);

      const totalCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(Model)
        .where(sql`${Model.allowedUserId} IS NULL`);

      const totalCount = totalCountResult[0]?.count ?? 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        models,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit,
          offset,
        },
      };
    }),

  getByModality: publicProcedure
    .input(z.object({ modality: z.enum(["text-to-text", "text-to-image"]) }))
    .query(async ({ ctx, input }) => {
      const models = await ctx.db
        .select({
          id: Model.id,
          name: Model.name,
          description: Model.description,
          modality: Model.modality,
          supportedEndpoints: Model.supportedEndpoints,
          enabled: Model.enabled,
          allowedUserId: Model.allowedUserId,
          metadata: Model.metadata,
        })
        .from(Model)
        .where(
          and(
            eq(Model.modality, input.modality),
            or(
              sql`${Model.allowedUserId} IS NULL`,
              ...(ctx.session?.userId
                ? [eq(Model.allowedUserId, ctx.session.userId)]
                : [])
            ),
            eq(Model.enabled, true)
          )
        );

      return models;
    }),

  getByNames: publicProcedure
    .input(
      z.object({
        names: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const models = await ctx.db
        .select({
          id: Model.id,
          name: Model.name,
          description: Model.description,
          modality: Model.modality,
          supportedEndpoints: Model.supportedEndpoints,
          inputCreditsPerToken: Model.icpt,
          outputCreditsPerToken: Model.ocpt,
          enabled: Model.enabled,
          metadata: Model.metadata,
        })
        .from(Model)
        .where(
          and(
            inArray(Model.name, input.names),
            sql`${Model.allowedUserId} IS NULL`
          )
        );

      return models;
    }),

  getCosts: publicProcedure
    .input(z.object({ modelName: z.string() }))
    .query(async ({ ctx, input }) => {
      const model = await ctx.db
        .select({
          icpt: Model.icpt,
          ocpt: Model.ocpt,
          crc: Model.crc,
        })
        .from(Model)
        .where(
          and(
            eq(Model.name, input.modelName),
            sql`${Model.allowedUserId} IS NULL`
          )
        );
      return model;
    }),

  getModelInfo: publicProcedure
    .input(z.object({ modelName: z.string() }))
    .query(async ({ ctx, input }) => {
      const model = await ctx.db
        .select({
          metadata: Model.metadata,
        })
        .from(Model)
        .where(
          and(
            eq(Model.name, input.modelName),
            sql`${Model.allowedUserId} IS NULL`
          )
        );

      const metadata = model?.[0]?.metadata as {
        context_length?: number;
        max_output_length?: number;
      };
      if (!metadata) {
        return null;
      }

      const context_length = metadata.context_length;
      const max_output_tokens = metadata.max_output_length;

      return {
        context_length,
        max_output_tokens,
      };
    }),

  getPopularModels: publicProcedure
    .input(
      z.object({
        days: z.number().default(30),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { days, limit } = input;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split("T")[0];

      const allEnabledModels = await ctx.db
        .select({
          id: Model.id,
          name: Model.name,
          description: Model.description,
        })
        .from(Model)
        .where(
          and(sql`${Model.allowedUserId} IS NULL`, eq(Model.enabled, true))
        );

      const popularModelsFromStats = await ctx.db
        .select({
          modelName: DailyModelStats.model,
          totalRequests: sum(DailyModelStats.requestCount),
        })
        .from(DailyModelStats)
        .where(sql`${DailyModelStats.date} >= ${startDateStr}`)
        .groupBy(DailyModelStats.model)
        .having(sql`SUM(${DailyModelStats.requestCount}) > 0`)
        .orderBy(desc(sum(DailyModelStats.requestCount)))
        .limit(limit);

      const modelNames = popularModelsFromStats.map((stat) => stat.modelName);

      if (modelNames.length > 0) {
        const modelDetails = await ctx.db
          .select({
            name: Model.name,
            description: Model.description,
          })
          .from(Model)
          .where(
            and(
              inArray(Model.name, modelNames),
              sql`${Model.allowedUserId} IS NULL`,
              eq(Model.enabled, true)
            )
          );

        return modelDetails;
      }

      return allEnabledModels.slice(0, limit);
    }),
});
