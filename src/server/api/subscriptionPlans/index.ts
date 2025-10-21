import { env } from "@/env.mjs";
import { db } from "@/schema/db";
import { SubscriptionPlan, User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { stripe } from "../stripe/stripe";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const subscriptionPlans = createTRPCRouter({
  getPlans: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: SubscriptionPlan.id,
        displayName: SubscriptionPlan.displayName,
        monthlyFee: SubscriptionPlan.monthlyFee,
        advertisedMonthlyRequests: SubscriptionPlan.advertisedMonthlyRequests,
        stripePriceId: SubscriptionPlan.stripePriceId,
      })
      .from(SubscriptionPlan)
      .where(
        and(
          eq(SubscriptionPlan.active, true),
          eq(SubscriptionPlan.billingMode, "prepaid")
        )
      );
  }),
  createSubscriptionUrl: protectedProcedure
    .input(z.object({ priceID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user: authedUser } = ctx;
      const { priceID } = input;

      const [user] = await ctx.db
        .select({
          id: User.id,
          stripeId: User.stripeCustomerId,
          email: User.email,
        })
        .from(User)
        .where(eq(User.id, authedUser.id));
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      let customerId = user.stripeId;
      if (!customerId) {
        if (!user.email) throw new TRPCError({ code: "NOT_FOUND" });

        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });
        await db
          .update(User)
          .set({ stripeCustomerId: customer.id })
          .where(eq(User.id, user.id));
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        success_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
        line_items: [{ price: priceID, quantity: 1 }],
        mode: "subscription",
      });

      return { url: session.url };
    }),
});
