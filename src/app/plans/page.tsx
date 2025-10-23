import { ActionButton } from "@/_components/ActionButton";
import { Card } from "@/_components/Card";
import { PlanCard } from "@/_components/PlanCard";
import { serverClient } from "@/trpc/server";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";

export const dynamic = "force-dynamic";

export default async function page() {
  const plans = await serverClient.subscriptionPlans.getPlans.query();
  return (
    <div className="flex flex-col min-h-screen items-center p-4 justify-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl py-4">Sybil Pricing Plans</h1>
        <Card className="flex items-center h-12 gap-2">
          <div className="rounded-sm">
            {" "}
            <ChatBubbleOvalLeftIcon className="h-4 w-4 text-mf-sybil-300" />
          </div>
          <div>
            <span>Request Based Usage, </span>
            <span className="text-mf-sybil-300">or Pay as you go</span>
          </div>
        </Card>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-10">
        {plans?.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
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
