import { ActionButton } from "@/_components/ActionButton";
import { Card } from "@/_components/Card";
import { PlanCard } from "@/_components/PlanCard";
import { serverClient } from "@/trpc/server";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function page() {
  const plans = await serverClient.subscriptionPlans.getPlans.query();
  let currentPlan = null;
  try {
    currentPlan = await serverClient.account.getUserSubscription.query();
  } catch {
    currentPlan = null;
  }
  return (
    <div
      className={`flex flex-col min-h-screen items-center p-4 justify-center py-24 lg:py-4`}
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl py-2 font-[300]">
          <span className="font-[400]">Sybil</span> Pricing Plans
        </h1>
        <Card className="flex items-center !p-2 gap-2 text-sm">
          <div className="rounded-sm">
            {" "}
            <ChatBubbleOvalLeftIcon className="h-4 w-4 text-mf-sybil-300" />
          </div>
          <div>
            <span>Request Based Usage, </span>
            <Link href="/settings" className="text-mf-sybil-300">
              or Pay as You Go
            </Link>
          </div>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 py-12">
        {plans?.map((plan) => (
          <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} />
        ))}
      </div>
      <div className="font-poppins text-center text-sm">
        <p className="pb-6 whitespace-nowrap">
          Sybil Team is on standby to ensure a personalized fit
        </p>
        <div className="flex justify-center gap-3">
          <ActionButton
            variant="noir"
            width="md"
            height="sm"
            buttonText="Support"
            href="mailto:devs@manifold.inc"
          />
          <ActionButton
            href="mailto:james@manifold.inc"
            width="md"
            height="sm"
            buttonText="Enterprise"
          />
        </div>
      </div>
    </div>
  );
}
