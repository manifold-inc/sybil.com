import { env } from "@/env.mjs";
import { stripe } from "@/server/api/stripe/stripe";
import createSubscription from "@/utils/stripe/createSubscription";
import deleteSubscription from "@/utils/stripe/deleteSubscription";
import handleInvoicePaymentFailed from "@/utils/stripe/handleInvoicePaymentFailed";
import handleInvoicePaymentSucceeded from "@/utils/stripe/handleInvoicePaymentSucceeded";
import handleInvoiceUpcoming from "@/utils/stripe/handleInvoiceUpcoming";
import handleSessionCompleted from "@/utils/stripe/handleSessionCompleted";
import updateSubscription from "@/utils/stripe/updateSubscription";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  if (!req.body) {
    return new Response("Missing request body", { status: 400 });
  }

  const rawBody = await buffer(req.body);
  const signature = req.headers.get("stripe-signature");

  if (!signature || !env.STRIPE_ENDPOINT_SECRET) {
    return new Response("Missing Stripe signature or secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_ENDPOINT_SECRET
    );
  } catch {
    return new Response("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
      await createSubscription(event);
      break;

    case "customer.subscription.updated":
      await updateSubscription(event);
      break;

    case "customer.subscription.deleted":
      await deleteSubscription(event);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;

    case "checkout.session.completed":
      await handleSessionCompleted(event);
      break;

    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
