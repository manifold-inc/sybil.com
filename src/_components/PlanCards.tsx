"use client";

import { ActionButton } from "@/_components/ActionButton";
import { useAuth } from "@/_components/providers";
import { reactClient } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

enum PlanStatus {
  UNAUTHED = "unauthed",
  CURRENT = "current",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  ENTERPRISE = "enterprise",
}

type PlanOutput = RouterOutputs["subscriptionPlans"]["getPlans"][number];

export function PlanCard({
  plan,
  clickedPlan,
  onClick,
}: {
  plan: PlanOutput;
  clickedPlan?: boolean;
  onClick?: () => void;
}) {
  const auth = useAuth();
  const router = useRouter();
  const { user } = useAuth();

  // const { data: currentPlan } =
  //   reactClient.account.getUserSubscription.useQuery(undefined, {
  //     enabled: auth.status !== "LOADING",
  //   });

  const currentPlan = undefined;

  const createSubscription =
    reactClient.subscriptionPlans.createSubscriptionUrl.useMutation({
      onSuccess: ({ url }) => {
        if (url) {
          window.location.href = url;
        }
      },
    });

  // const manageSubscription = api.stripe.manageSubscription.useMutation({
  //   onSuccess: ({ url }) => {
  //     if (url) {
  //       window.location.href = url;
  //     }
  //   },
  // });

  // const getPlanStatus = (): PlanStatus | null => {
  //   if (plan.displayName === "Targon Enterprise") return PlanStatus.ENTERPRISE;
  //   if (!planDetails) return null;
  //   if (!user) return PlanStatus.UNAUTHED;
  //   if (!currentPlan?.stripeId) return PlanStatus.UPGRADE;
  //   if (currentPlan?.planId === planDetails.id) return PlanStatus.CURRENT;
  //
  //   return planDetails.id > currentPlan.planId
  //     ? PlanStatus.UPGRADE
  //     : PlanStatus.DOWNGRADE;
  // };

  // const handleSubscribe = () => {
  //   const status = getPlanStatus();
  //   switch (status) {
  //     case PlanStatus.ENTERPRISE:
  //       router.push("/pricing/enterprise");
  //       return;
  //     case null:
  //       router.push("/sign-in");
  //       return;
  //     case PlanStatus.UNAUTHED:
  //       router.push("/sign-in");
  //       return;
  //     case PlanStatus.CURRENT:
  //       manageSubscription.mutate();
  //       return;
  //     case PlanStatus.DOWNGRADE:
  //     case PlanStatus.UPGRADE:
  //       if (currentPlan?.planId === 1) {
  //         if (!priceId) return;
  //         createSubscription.mutate({ priceID: priceId });
  //       } else {
  //         manageSubscription.mutate();
  //       }
  //       return;
  //   }
  // };

  const renderButtonLabel = () => {
    // const status = getPlanStatus();
    //
    // switch (status) {
    //   case PlanStatus.ENTERPRISE:
    //     return "Let's Talk";
    //   case PlanStatus.UNAUTHED:
    //     return "Start Plan";
    //   case PlanStatus.CURRENT:
    //     return "View Plan";
    //   case PlanStatus.UPGRADE:
    //     if (currentPlan?.planId === 1) return "Start Plan";
    //     return "Upgrade";
    //   case PlanStatus.DOWNGRADE:
    //     return "Downgrade";
    //   default:
    //     return "Start Plan";
    // }
    return "Start Plan";
  };

  return (
    <div
      className={`bg-mf-ash-800/50 transition-colors duration-300 hover:opacity-90 flex flex-col gap-4 rounded-md p-5 flex-1 border ${
        clickedPlan ? "border-mf-sally-500" : "border-mf-night-600"
      }`}
      onClick={onClick}
    >
      <div className="bg-mf-dark-gray flex py-12 items-center justify-center gap-1 rounded-md py-auto">
        <Image src="/sybil.svg" alt="Targon" width={60} height={60} priority />
      </div>

      <div className="flex my-auto justify-between">
        <p className={`xl:text-lg ${currentPlan ? "text-mf-sally-500" : ""}`}>
          {plan.displayName}
        </p>
        <p
          className={`xl:text-lg ${currentPlan ? "text-mf-sybil-500" : "text-mf-sally-500"} `}
        >
          {plan.monthlyFee}
        </p>
      </div>

      <div className="flex">
        <ul className="font-poppins text-xs xl:text-sm font-light whitespace-nowrap flex flex-col gap-5">
          <li className="flex items-center">
            <div className="bg-mf-sally-700 h-3 w-3 rounded-xs"></div>
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
          createSubscription.mutate({ priceID: plan.stripePriceId });
        }}
        buttonText={renderButtonLabel()}
      />
    </div>
  );
}
