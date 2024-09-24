import { z } from "zod";

import { Path } from "@/constant";
import {
  createTRPCRouter,
  publicAuthlessProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const mainRouter = createTRPCRouter({
  getUser: publicProcedure.query(({ ctx }) => {
    // Public so it doesnt error if not logged in
    return ctx.user?.id ?? null;
  }),
  autocomplete: publicAuthlessProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      if (input.query.length < 3) {
        return [];
      }
      const res = await fetch(
        `${Path.API.Search}/autocomplete?q=${input.query}`,
        {
          method: "GET",
        },
      );
      if (res.status !== 200) {
        return [];
      }
      const ReqSchema = z.tuple([z.string(), z.array(z.string())]);
      const results = ReqSchema.parse(await res.json()).at(1) as string[];
      return results;
    }),
});
