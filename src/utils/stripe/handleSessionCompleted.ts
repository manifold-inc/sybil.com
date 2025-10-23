import { env } from "@/env.mjs";
import { stripe } from "@/server/api/stripe/stripe";
import type Stripe from "stripe";

import handleCheckoutCredits from "./handleCheckoutCredits";

const handleSessionCompleted = async (
  event: Stripe.CheckoutSessionCompletedEvent
) => {
  const session = event.data.object;
  const customerId = session.customer as string;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  for (const lineItem of lineItems.data) {
    switch (lineItem.price?.id) {
      case env.STRIPE_CREDIT_PRICE_ID:
        await handleCheckoutCredits(lineItem, customerId);
        break;
    }
  }
};

export default handleSessionCompleted;
