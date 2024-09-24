import { type MainSchema } from "@/server/api/main/schema";

export type Action = {
  type: "UPDATE_DATA";
  data: Partial<Data>;
};

export type Data = MainSchema.UpdateThreadBlockOption & {
  query: string;
};
