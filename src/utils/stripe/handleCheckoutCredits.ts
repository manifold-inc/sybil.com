import { CREDIT_PER_DOLLAR } from "@/constant";
import { db } from "@/schema/db";
import { User } from "@/schema/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const handleCheckoutCredits = async (
  lineItem: Stripe.LineItem,
  customerId: string
) => {
  const quantity = lineItem.quantity ?? 0;

  const creditsPurchased = quantity * CREDIT_PER_DOLLAR;

  try {
    const [user] = await db
      .select({ id: User.id, credits: User.credits })
      .from(User)
      .where(eq(User.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    await db
      .update(User)
      .set({ credits: (user.credits ?? 0) + creditsPurchased })
      .where(eq(User.id, user.id));
  } catch {
    throw new TRPCError({
      code: "CONFLICT",
      message: "User not issued credits",
    });
  }
};

export default handleCheckoutCredits;
