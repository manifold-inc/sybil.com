import { db } from "@/schema/db";
import { Subscription, SubscriptionPlan, User } from "@/schema/schema";
import { stripe } from "@/server/api/stripe/stripe";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const createSubscriptionInternal = async (
  userId: number,
  subscription: Stripe.Subscription,
  planId: number
) => {
  await db.transaction(async (tx) => {
    await tx.insert(Subscription).values({
      userId: userId,
      subscriptionId: subscription.id,
      planId: planId,
      status: subscription.status,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      createdAt: new Date(subscription.created * 1000),
      endedAt: subscription.ended_at
        ? new Date(subscription.ended_at * 1000)
        : null,
    });

    await tx.update(User).set({ planId: planId }).where(eq(User.id, userId));
  });
};

const createSubscription = async (
  event: Stripe.CustomerSubscriptionCreatedEvent
) => {
  const subscription = event.data.object;
  if (!subscription.items?.data?.[0]?.price?.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Price ID not found",
    });
  }

  const [user] = await db
    .select({ id: User.id })
    .from(User)
    .where(eq(User.stripeCustomerId, subscription.customer as string));

  if (!user?.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const [plan] = await db
    .select({
      id: SubscriptionPlan.id,
      billingMode: SubscriptionPlan.billingMode,
      monthlyRequests: SubscriptionPlan.advertisedMonthlyRequests,
    })
    .from(SubscriptionPlan)
    .where(
      eq(SubscriptionPlan.stripePriceId, subscription.items.data[0].price.id)
    );

  if (!plan) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid subscription",
    });
  }

  await createSubscriptionInternal(user.id, subscription, plan.id);

  const { status } = await stripe.invoices.retrieve(
    event.data.object.latest_invoice as string
  );

  if (status === "paid") {
    await db.transaction(async (tx) => {
      await tx
        .update(Subscription)
        .set({
          status: "active",
        })
        .where(eq(Subscription.subscriptionId, subscription.id));

      if (plan.billingMode === "prepaid") {
        await tx
          .update(User)
          .set({
            monthlyRequests: plan.monthlyRequests,
          })
          .where(eq(User.id, user.id));
      }
      // For postpaid enterprise, credits are handled differently
    });
  }
};

export default createSubscription;
