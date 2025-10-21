import { db } from "@/schema/db";
import { Subscription, User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const handleInvoicePaymentFailed = async (
  event: Stripe.InvoicePaymentFailedEvent
) => {
  const invoice = event.data.object;

  const subscriptionId = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionId || typeof subscriptionId !== "string") {
    return;
  }

  const [user] = await db
    .select({ userId: User.id })
    .from(User)
    .where(eq(User.stripeCustomerId, invoice.customer as string));
  if (!user?.userId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await db
    .update(Subscription)
    .set({
      status: "past_due",
    })
    .where(eq(Subscription.subscriptionId, subscriptionId));
};

export default handleInvoicePaymentFailed;
