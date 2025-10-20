import { Client } from "@planetscale/database";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { env } from "process";

import { LuciaAdapter } from "./lucia_adapter";
import { Session, User } from "./schema";

config({ path: "../../.env" });
const connection = new Client({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
});

export const db = drizzle(connection);
export const adapter = new LuciaAdapter(db, Session, User);
