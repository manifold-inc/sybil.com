import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { z } from "zod";

import { genId, User } from "@/schema/schema";
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
      cookies().set(
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
      const userId = genId.user();
      await ctx.db.insert(User).values({
        id: userId,
        email,
        password: hashedPassword,
        emailConfirmed: false,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return;
    }),
});
