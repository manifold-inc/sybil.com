import { db } from "@/schema/db";
import { Subscription, SubscriptionPlan, User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const handleInvoicePaymentSucceeded = async (
  event: Stripe.InvoicePaymentSucceededEvent
) => {
  const invoice = event.data.object;

  const subscriptionId = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invoice does not contain a subscription ID",
    });
  }

  const [user] = await db
    .select({ userId: User.id, planId: User.planId })
    .from(User)
    .where(eq(User.stripeCustomerId, invoice.customer as string));

  if (!user?.planId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(Subscription)
      .set({
        status: "active",
      })
      .where(eq(Subscription.subscriptionId, subscriptionId as string));

    const [plan] = await tx
      .select({
        monthlyRequests: SubscriptionPlan.advertisedMonthlyRequests,
        billingMode: SubscriptionPlan.billingMode,
        enterprise: SubscriptionPlan.enterprise,
      })
      .from(SubscriptionPlan)
      .where(eq(SubscriptionPlan.id, user.planId ?? 0));

    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User does not have a subscription plan",
      });
    }

    // Only give credits for prepaid plans
    if (plan.billingMode === "prepaid") {
      await tx
        .update(User)
        .set({
          planRequests: plan.monthlyRequests,
        })
        .where(eq(User.id, user.userId));
    }
    // For postpaid enterprise, credits are handled differently
  });
};

export default handleInvoicePaymentSucceeded;
