import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  datetime,
  int,
  json,
  mysqlTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz");
export const genId = {
  user: () => "u_" + nanoid(30),
  session: () => "s_" + nanoid(30),
  file: () => "f_" + nanoid(30),
};

export const User = mysqlTable("user", {
  iid: serial("iid").primaryKey(),
  id: varchar("id", {
    length: 32,
  })
    .unique()
    .notNull(),
  email: varchar("email", { length: 255 }).unique(),
  googleId: varchar("googleId", { length: 36 }).unique(),
  emailConfirmed: boolean("email_confirmed").notNull().default(true),
  password: varchar("password", { length: 255 }),
  createdAt: datetime("createdAt", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const Session = mysqlTable("session", {
  iid: serial("iid").primaryKey(),
  id: varchar("id", {
    length: 255,
  })
    .unique()
    .notNull(),
  userId: varchar("user_id", {
    length: 32,
  })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: datetime("createdAt", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export type Search = typeof Search.$inferSelect;
export const Search = mysqlTable("search", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 32 }),
  userIid: bigint("user_iid", { unsigned: true, mode: "number" }),
  query: text("query").notNull(),
  sources: json("sources").$type<string[]>().notNull(),
  completion: text("completion").notNull(),
  createdAt: datetime("created_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const File = mysqlTable("file", {
  id: serial("id").primaryKey(),
  userIid: bigint("userIid", { mode: "number", unsigned: true })
    .notNull()
    .references(() => User.iid),
  key: varchar("key", { length: 255 }).notNull().unique(),
  size: int("size").notNull(),
  name: text("name").notNull(),
  createdAt: datetime("created_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
