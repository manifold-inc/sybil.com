import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { z } from "zod";

import { ApiKey, genId, User } from "@/schema/schema";
import { lucia } from "@/server/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const accountRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({ id: User.id, password: User.password })
        .from(User)
        .where(eq(User.email, input.email));
      if (!user?.password)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid Credentials",
        });
      const validPassword = await new Scrypt().verify(
        user.password,
        input.password,
      );
      if (!validPassword)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid Credentials",
        });
      const session = await lucia.createSession(user.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }),
  createAccount: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;
      if (!email.includes("@") || !email.includes(".") || email.length < 3) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid Email" });
      }
      if (password.length < 8 || password.length > 255) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password should be atleast 8 characters",
        });
      }
      const [existing] = await ctx.db
        .select({ id: User.id })
        .from(User)
        .where(eq(User.email, email));
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Account already Exists",
        });

      const hashedPassword = await new Scrypt().hash(password);
      const pubId = genId.user();
      const result = await ctx.db.insert(User).values({
        pubId,
        email,
        password: hashedPassword,
        emailVerified: false,
      });
      const userId = result.insertId;

      const session = await lucia.createSession(Number(userId), {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return;
    }),
  getUser: publicProcedure.query(async ({ ctx }) => {
    // Public so it doesn't error if not logged in
    if (!ctx.user?.id) return null;
    const [user] = await ctx.db
      .select({
        credits: User.credits,
        id: User.id,
        name: User.name,
        email: User.email,
        apiKey: ApiKey.id,
      })
      .from(User)
      .innerJoin(ApiKey, eq(ApiKey.userId, User.id))
      .where(eq(User.id, ctx.user.id))
      .limit(1);
    return user ?? null;
  }),
});
