import { createTRPCRouter, publicProcedure } from "../trpc";

interface ModelData {
  model: string;
  context_length: number | null;
}

export const modelRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const response = await fetch("https://targon.com/api/models");
    const data = (await response.json()) as ModelData[];
    return data;
  }),
});
