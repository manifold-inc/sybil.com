import { db } from "@/schema/db";
import { Subscription, SubscriptionPlan, User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const updateSubscription = async (
  event: Stripe.CustomerSubscriptionUpdatedEvent
) => {
  const subscription = event.data.object;
  if (!subscription.items?.data?.[0]?.price?.id) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Price ID not found",
    });
  }

  const [user] = await db
    .select({ userId: User.id })
    .from(User)
    .where(eq(User.stripeCustomerId, subscription.customer as string));
  if (!user?.userId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  const [plan] = await db
    .select({
      id: SubscriptionPlan.id,
      monthlyRequests: SubscriptionPlan.advertisedMonthlyRequests,
      billingMode: SubscriptionPlan.billingMode,
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

  await db.transaction(async (tx) => {
    await tx
      .update(Subscription)
      .set({
        subscriptionId: subscription.id,
        planId: plan.id,
        status: subscription.status,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        endedAt: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : null,
      })
      .where(eq(Subscription.userId, user.userId));

    await tx
      .update(User)
      .set({ planId: plan.id })
      .where(eq(User.id, user.userId));
  });
};

export default updateSubscription;
