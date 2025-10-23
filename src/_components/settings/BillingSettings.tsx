"use client";

import { Card } from "@/_components/Card";
import { CREDIT_PER_DOLLAR } from "@/constant";
import { api } from "@/trpc/react";
import {
  ArrowPathIcon,
  CreditCardIcon,
  PencilIcon,
  PlusIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { ActionButton } from "../ActionButton";

export function BillingSettings() {
  const { data: user } = api.account.getUser.useQuery();
  const { data: paymentMethodsData } = api.stripe.getPaymentMethods.useQuery();

  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  const createCheckoutSession = api.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const { data: userSubscription } =
    api.subscriptionPlans.getUserSubscription.useQuery();

  const getBillingPortal = api.stripe.getBillingPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const createSetupSession = api.stripe.createSetupSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const uniquePaymentMethods = useMemo(() => {
    if (!paymentMethodsData?.paymentMethods) return [];
    const seen = new Set();
    return paymentMethodsData.paymentMethods.filter((pm) => {
      const key = `${pm.last4}-${pm.expMonth}-${pm.expYear}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [paymentMethodsData?.paymentMethods]);

  const handleBuy = () => {
    const amount = isCustom ? parseInt(customValue) || 0 : purchaseAmount;
    if (amount > 0) {
      setIsAddingCredits(true);
      createCheckoutSession.mutate({ quantity: amount });
    }
  };

  const handleManagePaymentMethods = () => {
    getBillingPortal.mutate(undefined, {
      onError: () => createSetupSession.mutate(),
    });
  };

  const handleAddPaymentMethod = () => {
    createSetupSession.mutate();
  };

  const totalCredits = user?.credits ?? 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Name + Plan */}
            <input
              type="text"
              value={"First Last"}
              className="w-full bg-mf-gray/10 border border-mf-gray/15 rounded-md px-3 py-2 focus:ring-1 focus:ring-mf-noir-400 focus:border-mf-noir-400"
            />
            <input
              type="email"
              value={"email@email.com"}
              className="w-full bg-mf-gray/10 border border-mf-gray/15 rounded-md px-3 py-2 focus:ring-1 focus:ring-mf-noir-400 focus:border-mf-noir-400"
            />
            <div className="flex items-center space-x-2 bg-mf-gray/10 rounded-md px-3 py-2">
              <WalletIcon className="w-4 h-4 text-mf-sally-500" />
              <span>
                {userSubscription?.subscriptionName ?? "Pay as you go"}
              </span>
            </div>

            {/* Right: Email + Buttons */}
            <div className="flex items-center space-x-4 justify-self-end">
              <ActionButton
                width="lg"
                height="lg"
                variant="noir"
                buttonText="Change Plan"
              />
              <ActionButton width="lg" height="lg" buttonText="Save Changes" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-lg font-medium">Account Balance</h2>
            <div className="text-xs bg-mf-new-500 p-2 px-4 rounded-sm">
              <span className="text-mf-sybil-300">{user?.planRequests}</span>{" "}
              Total Available Request
            </div>
          </div>
          <div className="text-4xl font-light justify-self-center pb-8">
            <span className="text-mf-sybil-300">$</span>
            {((totalCredits || 0) / CREDIT_PER_DOLLAR).toFixed(2)}
          </div>

          {/* Quick add amounts and Add Credits button */}
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isAddingCredits &&
                (purchaseAmount !== 0 || (isCustom && customValue !== ""))
              ) {
                handleBuy();
              }
            }}
            tabIndex={0}
          >
            {[25, 50].map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsCustom(false);
                  setPurchaseAmount(amount);
                }}
                disabled={isAddingCredits}
                className={`rounded-md px-4 py-2 transition-colors disabled:opacity-50 ${
                  !isCustom && purchaseAmount === amount
                    ? "bg-mf-edge-500 text-black"
                    : "bg-[#1f222E]/30  hover:bg-mf-gray/20 "
                }`}
              >
                +${amount}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsCustom(true);
                setCustomValue("");
              }}
              disabled={isAddingCredits}
              className={`rounded-md px-4 py-2 transition-colors disabled:opacity-50 ${
                isCustom
                  ? "bg-mf-edge-500 text-black"
                  : "bg-[#1f222E]/30  hover:bg-mf-gray/20 "
              }`}
            >
              Custom
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuy}
              disabled={
                isAddingCredits ||
                purchaseAmount === 0 ||
                (isCustom && customValue === "")
              }
              className={`flex items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors disabled:opacity-50 ${
                isAddingCredits ||
                purchaseAmount === 0 ||
                (isCustom && customValue === "")
                  ? "bg-mf-gray/10 border-mf-gray/10 !disabled:hover:bg-mf-gray/20 border"
                  : "bg-mf-sybil-300 text-mf-ash-700"
              }`}
            >
              {isAddingCredits ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span className="whitespace-nowrap">
                {isAddingCredits ? "Processing..." : "Add Credits"}
              </span>
            </motion.button>
          </div>

          {/* Custom amount input */}
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <div className="flex items-center space-x-2">
                <span className="text-mf-sybil-300 -translate-y-0.25 text-2xl">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={purchaseAmount.toString()}
                  onChange={(e) => {
                    setPurchaseAmount(Number(e.target.value));
                  }}
                  placeholder="0.00"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !isAddingCredits &&
                      (purchaseAmount !== 0 || (isCustom && customValue !== ""))
                    ) {
                      handleBuy();
                    }
                  }}
                  className="flex-1 bg-transparent text-2xl focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          <h2 className="my-4 text-lg font-medium">Payment Methods</h2>
          <div className="space-y-4">
            {uniquePaymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-mf-gray/10 border-mf-gray/10 flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1f222E]/30 flex h-8 w-12 items-center justify-center rounded">
                    <CreditCardIcon className="h-5 w-5 opacity-70" />
                  </div>
                  <div>
                    <div className="">•••• {method.last4}</div>
                    <div className="text-xs opacity-70">
                      Expires {method.expMonth?.toString().padStart(2, "0")}/
                      {method.expYear?.toString().slice(-2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleManagePaymentMethods}
                    className="hover: p-2 opacity-70"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddPaymentMethod}
              className="border-mf-gray/30 hover:border-mf-gray/40 w-full rounded-md border border-dashed px-4 py-2 opacity-70 transition-colors"
            >
              + Add Payment Method
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
