import { env } from "@/env.mjs";
import { db } from "@/schema/db";
import { User } from "@/schema/schema";
import { stripe } from "@/server/api/stripe/stripe";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ quantity: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { user: authedUser } = ctx;

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

        await ctx.db
          .update(User)
          .set({ stripeCustomerId: customer.id })
          .where(eq(User.id, user.id));

        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: env.STRIPE_CREDIT_PRICE_ID,
            quantity: input.quantity,
          },
        ],
        mode: "payment",
        success_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
        cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
      });

      return { url: session.url };
    }),

  // Opens a Stripe Checkout session in setup mode to add a card to the customer
  createSetupSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { user: authedUser } = ctx;

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
        metadata: { userId: String(user.id) },
      });
      await ctx.db
        .update(User)
        .set({ stripeCustomerId: customer.id })
        .where(eq(User.id, user.id));
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "setup",
      payment_method_types: ["card"],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return { url: session.url };
  }),

  getBillingPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;

    const [userData] = await db.select().from(User).where(eq(User.id, user.id));
    if (!userData) throw new TRPCError({ code: "NOT_FOUND" });

    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      if (!userData.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No email found for user.",
        });
      }

      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: { userId: String(userData.id) },
      });

      await db
        .update(User)
        .set({ stripeCustomerId: customer.id })
        .where(eq(User.id, userData.id));

      customerId = customer.id;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
    });
    return { url: session.url };
  }),

  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const [userData] = await db.select().from(User).where(eq(User.id, user.id));
    if (!userData) throw new TRPCError({ code: "NOT_FOUND" });

    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      if (!userData.email) {
        return { paymentMethods: [] };
      }

      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: { userId: String(userData.id) },
      });

      await db
        .update(User)
        .set({ stripeCustomerId: customer.id })
        .where(eq(User.id, userData.id));

      customerId = customer.id;
      return { paymentMethods: [] };
    }

    const [paymentMethods, retrievedCustomer] = await Promise.all([
      stripe.paymentMethods.list({ customer: customerId, type: "card" }),
      stripe.customers.retrieve(customerId),
    ]);

    let defaultPmId: string | undefined = undefined;
    if (!("deleted" in retrievedCustomer)) {
      const defaultPm =
        retrievedCustomer.invoice_settings?.default_payment_method;
      defaultPmId = typeof defaultPm === "string" ? defaultPm : defaultPm?.id;
    }

    return {
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPmId,
      })),
    };
  }),
});
