import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz");
export const genId = {
  user: () => "u_" + nanoid(30),
  session: () => "s_" + nanoid(30),
  apiKey: () => "ak_" + nanoid(29), // 3 + 29 = 32 chars to fit varchar(32)
  request: () => "req_" + nanoid(30),
  file: () => "f_" + nanoid(30),
};

export const User = mysqlTable("user", {
  id: serial("id").primaryKey(),
  pubId: varchar("pub_id", { length: 32 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  googleId: varchar("google_id", { length: 36 }).unique(),
  password: varchar("password", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 32 }).unique(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  credits: bigint("credits", { unsigned: true, mode: "number" })
    .notNull()
    .default(0),
  name: varchar("name", { length: 255 }),
  allowOverspend: boolean("allow_overspend").notNull().default(false),
  role: mysqlEnum("role", ["USER", "ADMIN"]).notNull().default("USER"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  planId: int("plan_id"),
  monthlyRequests: int("monthly_requests"),
});

export const Session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: bigint("user_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const ApiKey = mysqlTable("api_key", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: bigint("user_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const Model = mysqlTable("model", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  modality: mysqlEnum("modality", ["text-to-text", "text-to-image"]).notNull(),
  icpt: bigint("icpt", { unsigned: true, mode: "number" }).notNull().default(1),
  ocpt: bigint("ocpt", { unsigned: true, mode: "number" }).notNull().default(1),
  crc: bigint("crc", { unsigned: true, mode: "number" }).notNull().default(0),
  description: text("description"),
  supportedEndpoints: json("supported_endpoints").$type<string[]>().notNull(),
  enabled: boolean("enabled").notNull().default(false),
  allowedUserId: bigint("allowed_user_id", { unsigned: true, mode: "number" }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  config: json("config").$type<Record<string, unknown>>(),
  targonUid: varchar("targon_uid", { length: 128 }),
});

export const ModelRegistry = mysqlTable("model_registry", {
  id: serial("id").primaryKey(),
  modelId: bigint("model_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => Model.id, { onDelete: "cascade" }),
  modelName: varchar("model_name", { length: 255 }).notNull().unique(),
  url: varchar("url", { length: 512 }),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const Request = mysqlTable("request", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { unsigned: true, mode: "number" })
    .notNull()
    .references(() => User.id),
  requestId: varchar("request_id", { length: 32 }).notNull(),
  endpoint: varchar("endpoint", { length: 32 }).notNull(),
  promptTokens: int("prompt_tokens").notNull(),
  completionTokens: int("completion_tokens").notNull(),
  timeToFirstToken: int("time_to_first_token"),
  totalTime: int("total_time").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  modelId: bigint("model_id", { unsigned: true, mode: "number" }).references(
    () => Model.id
  ),
});

export const DailyStats = mysqlTable("daily_stats", {
  date: date("date").notNull(),
  userId: bigint("user_id", { unsigned: true, mode: "number" }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  requestCount: bigint("request_count", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  inputTokens: bigint("input_tokens", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  outputTokens: bigint("output_tokens", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  totalSpend: bigint("total_spend", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  timeToFirstToken: bigint("time_to_first_token", {
    unsigned: true,
    mode: "number",
  }),
  totalTime: bigint("total_time", { unsigned: true, mode: "number" }).notNull(),
  canceledRequests: bigint("canceled_requests", {
    unsigned: true,
    mode: "number",
  })
    .notNull()
    .default(0),
  modelId: bigint("model_id", { unsigned: true, mode: "number" }),
});

export const DailyModelStats = mysqlTable("daily_model_stats", {
  date: date("date").notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  requestCount: bigint("request_count", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  inputTokens: bigint("input_tokens", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  outputTokens: bigint("output_tokens", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  totalSpend: bigint("total_spend", {
    unsigned: true,
    mode: "number",
  }).notNull(),
  timeToFirstToken: bigint("time_to_first_token", {
    unsigned: true,
    mode: "number",
  }),
  totalTime: bigint("total_time", { unsigned: true, mode: "number" }).notNull(),
  canceledRequests: bigint("canceled_requests", {
    unsigned: true,
    mode: "number",
  })
    .notNull()
    .default(0),
  modelId: bigint("model_id", { unsigned: true, mode: "number" }).notNull(),
});

export const File = mysqlTable("file", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 255 }).notNull().unique(),
  size: int("size").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const SubscriptionPlan = mysqlTable("subscription_plan", {
  id: int("id").primaryKey().autoincrement(),
  displayName: varchar("display_name", { length: 64 }).notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).notNull(),
  advertisedMonthlyRequests: bigint("advertised_monthly_requests", {
    mode: "number",
  }).notNull(),
  active: boolean("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  enterprise: tinyint("enterprise").notNull().default(0),
  billingMode: mysqlEnum("billing_mode", ["postpaid", "prepaid"])
    .notNull()
    .default("prepaid"),
  stripePriceId: varchar("stripe_price_id", { length: 64 }).notNull(),
});

export const Subscription = mysqlTable("subscription", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", {
    unsigned: true,
    mode: "number",
  })
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id", { length: 255 }).notNull(),
  planId: int("plan_id").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  canceledAt: timestamp("canceled_at", { mode: "date" }).default(sql`NULL`),
  createdAt: timestamp("created_at", { mode: "date" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  endedAt: timestamp("ended_at", { mode: "date" }).default(sql`NULL`),
});

// Type exports
export type User = typeof User.$inferSelect;
export type Session = typeof Session.$inferSelect;
export type ApiKey = typeof ApiKey.$inferSelect;
export type Model = typeof Model.$inferSelect;
export type ModelRegistry = typeof ModelRegistry.$inferSelect;
export type Request = typeof Request.$inferSelect;
export type DailyStats = typeof DailyStats.$inferSelect;
export type DailyModelStats = typeof DailyModelStats.$inferSelect;
export type File = typeof File.$inferSelect;
