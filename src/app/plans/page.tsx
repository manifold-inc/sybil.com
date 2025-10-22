import { PlanCard } from "@/_components/PlanCard";
import { serverClient } from "@/trpc/server";

export default async function page() {
  const plans = await serverClient.subscriptionPlans.getPlans.query();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-wrap justify-center gap-6">
        {plans?.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  );
}
