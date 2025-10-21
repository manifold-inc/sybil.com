import { env } from "~/env";

type CreditPurchaseFailureArgs = {
  userStripeCustomerId: string;
  quantity: number;
  creditsAttempted: number;
  error: string;
};

type InvoiceProcessFailureArgs = {
  invoiceId: string;
  customerId: string;
  userPlanName?: string;
  error: string;
  billingPeriod?: string;
};

export const creditPurchaseFailure = async ({
  userStripeCustomerId,
  quantity,
  creditsAttempted,
  error,
}: CreditPurchaseFailureArgs) => {
  try {
    await fetch(env.MODEL_PAYMENT_DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Credit Purchase Failure",
            fields: [
              {
                name: "**Stripe Customer ID**",
                value: userStripeCustomerId,
                inline: false,
              },
              {
                name: "**Quantity**",
                value: quantity.toString(),
                inline: true,
              },
              {
                name: "**Credits Attempted**",
                value: creditsAttempted.toString(),
                inline: true,
              },
              {
                name: "**Error**",
                value: error,
                inline: false,
              },
            ],
            color: 0xff0000,
          },
        ],
      }),
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err }, { status: 500 });
  }
};

export const invoiceProcessFailure = async ({
  invoiceId,
  customerId,
  userPlanName,
  error,
  billingPeriod,
}: InvoiceProcessFailureArgs) => {
  try {
    await fetch(env.MODEL_PAYMENT_DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Enterprise Invoice Processing Failed",
            fields: [
              {
                name: "**Invoice ID**",
                value: invoiceId,
                inline: false,
              },
              {
                name: "**Customer ID**",
                value: customerId,
                inline: true,
              },
              {
                name: "**Plan Name**",
                value: userPlanName || "N/A",
                inline: true,
              },
              {
                name: "**Billing Period**",
                value: billingPeriod || "N/A",
                inline: true,
              },
              {
                name: "**Error**",
                value: error,
                inline: false,
              },
            ],
            color: 0xff0000,
          },
        ],
      }),
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err }, { status: 500 });
  }
};
