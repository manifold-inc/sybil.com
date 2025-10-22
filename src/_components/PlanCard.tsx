"use client";

import { ActionButton } from "@/_components/ActionButton";
import { useAuth } from "@/_components/providers";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import Image from "next/image";
import { useRouter } from "next/navigation";

enum PlanStatus {
  NULL = "null",
  UNAUTHED = "unauthed",
  CURRENT = "current",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  ENTERPRISE = "enterprise",
}

type PlanOutput = RouterOutputs["subscriptionPlans"]["getPlans"][number];

export function PlanCard({ plan }: { plan: PlanOutput }) {
  const auth = useAuth();
  const router = useRouter();
  const { user } = useAuth();

  const { data: currentPlan } = api.account.getUserSubscription.useQuery(
    undefined,
    {
      enabled: auth.status !== "LOADING",
    }
  );

  const createSubscription =
    api.subscriptionPlans.createSubscriptionUrl.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url;
        }
      },
    });

  const manageSubscription =
    api.subscriptionPlans.manageSubscription.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url;
        }
      },
    });

  const getPlanStatus = (): PlanStatus | null => {
    if (plan.displayName === "Targon Enterprise") return PlanStatus.ENTERPRISE;
    if (!user) return PlanStatus.UNAUTHED;
    if (currentPlan?.planId === plan.id) return PlanStatus.CURRENT;
    if (!currentPlan?.planId) return PlanStatus.NULL;

    return plan.id > currentPlan.planId
      ? PlanStatus.UPGRADE
      : PlanStatus.DOWNGRADE;
  };

  const handleSubscribe = (priceId: string) => {
    const status = getPlanStatus();
    switch (status) {
      case PlanStatus.ENTERPRISE:
        router.push("/pricing/enterprise");
        return;
      case null:
        router.push("/sign-in");
        return;
      case PlanStatus.UNAUTHED:
        router.push("/sign-in");
        return;
      case PlanStatus.CURRENT:
      case PlanStatus.DOWNGRADE:
      case PlanStatus.UPGRADE:
        manageSubscription.mutate();
        return;
      case PlanStatus.NULL:
        createSubscription.mutate({ priceID: priceId });
    }
  };

  const renderButtonLabel = () => {
    const status = getPlanStatus();

    switch (status) {
      case PlanStatus.ENTERPRISE:
        return "Let's Talk";
      case PlanStatus.UNAUTHED:
        return "Start Plan";
      case PlanStatus.CURRENT:
        return "View Plan";
      case PlanStatus.NULL:
        return "Start Plan";
      case PlanStatus.UPGRADE:
        return "Upgrade";
      case PlanStatus.DOWNGRADE:
        return "Downgrade";
      default:
        return "Start Plan";
    }
  };

  return (
    <div
      className={`bg-mf-new-900 transition-colors duration-300 hover:opacity-90 flex flex-col gap-4 rounded-md p-5 flex-1 border border-mf-new-500`}
    >
      <div className="bg-mf-dark-gray flex py-12 items-center justify-center gap-1 rounded-md py-auto">
        <Image src="/sybil.svg" alt="Targon" width={60} height={60} priority />
      </div>

      <div className="flex my-auto justify-between">
        <p className={`xl:text-lg text-mf-edge-500`}>{plan.displayName}</p>
        <p className={`xl:text-lg text-mf-sybil-300`}>
          ${Number(plan.monthlyFee)}
        </p>
      </div>

      <div className="flex">
        <ul className="font-poppins text-xs xl:text-sm font-light whitespace-nowrap flex flex-col gap-5">
          <li className="flex items-center">
            <div className="bg-mf-sybil-300 h-3 w-3 rounded-xs" />
            <p className="pl-2">
              {plan.advertisedMonthlyRequests} of requests included
            </p>
          </li>
        </ul>
      </div>

      <ActionButton
        width="md"
        height="sm"
        className="whitespace-nowrap"
        onClick={() => {
          handleSubscribe(plan.stripePriceId);
        }}
        buttonText={renderButtonLabel()}
      />
    </div>
  );
}
