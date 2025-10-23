import { db } from "@/schema/db";
import { Subscription, User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const deleteSubscription = async (
  event: Stripe.CustomerSubscriptionDeletedEvent
) => {
  const subscription = event.data.object;
  if (!subscription.customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer not found",
    });
  }

  const [user] = await db
    .select({ userId: User.id })
    .from(User)
    .where(eq(User.stripeCustomerId, subscription.customer as string));
  if (!user?.userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(Subscription)
      .set({
        status: "canceled",
        endedAt: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : new Date(),
      })
      .where(eq(Subscription.subscriptionId, subscription.id));

    await tx
      .update(User)
      .set({
        planId: 1,
        planRequests: 0,
      })
      .where(eq(User.id, user.userId));
  });
};

export default deleteSubscription;
