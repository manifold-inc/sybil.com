"use client";

import { Card } from "@/_components/Card";
import { CREDIT_PER_DOLLAR } from "@/constant";
import { api } from "@/trpc/react";
import {
  ArrowPathIcon,
  CreditCardIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";

import { ActionButton } from "../ActionButton";
import { useAuth } from "../providers";
import { showTargonToast } from "../TargonToast";

export function BillingSettings() {
  const { data: paymentMethodsData } = api.stripe.getPaymentMethods.useQuery();
  const { user, status } = useAuth();

  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const hasChanges = useMemo(() => {
    return name !== (user?.name ?? "") || email !== (user?.email ?? "");
  }, [name, email, user?.name, user?.email]);

  useMemo(() => {
    if (status === "AUTHED" && user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user, status]);

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

  const updateUsername = api.account.updateUsername.useMutation({
    onError: (error) => {
      showTargonToast(`Error updating name: ${error.message}`);
    },
  });

  const updateEmail = api.account.updateEmail.useMutation({
    onError: (error) => {
      showTargonToast(`Error updating email: ${error.message}`);
    },
  });

  const handleSave = async () => {
    try {
      const promises = [];

      if (name.trim()) {
        promises.push(updateUsername.mutateAsync({ username: name }));
      }

      if (email.trim()) {
        promises.push(updateEmail.mutateAsync({ email }));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        showTargonToast("Profile updated successfully");
      } else {
        showTargonToast("No changes to save");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showTargonToast(`Error saving profile changes: ${message}`);
    }
  };

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
    const amount = purchaseAmount;
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

  return (
    <div className="space-y-6">
      {/* Credit Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <Card className="px-8 py-6">
          <h2 className=" pb-4 -mt-1 text-lg font-medium">Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Name + Plan */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-mf-new-700 rounded-md px-3 py-2 focus:ring-1 focus:ring-mf-noir-400 focus:border-mf-noir-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-mf-new-700 rounded-md px-3 py-2 focus:ring-1 focus:ring-mf-noir-400 focus:border-mf-noir-400"
            />
            <div className="flex items-center space-x-2 bg-mf-gray/10 rounded-md px-3 py-2">
              <Image
                src="/sybil.svg"
                alt="sybil"
                height={10}
                width={10}
                className="h-4 w-4"
              />
              <span>
                {userSubscription?.subscriptionName ?? "Pay as you go"}
              </span>
            </div>

            {/* Right: Email + Buttons */}
            <div className="flex w-full items-center space-x-4 justify-end">
              <ActionButton
                width="lg"
                height="lg"
                variant="noir"
                buttonText={userSubscription ? "Change Plan" : "View Plans"}
                className="w-full md:w-50"
                href="/plans"
              />
              <ActionButton
                width="lg"
                height="lg"
                onClick={handleSave}
                disabled={!hasChanges}
                className={`w-full md:w-50 ${hasChanges ? " text-mf-background hover:opacity-70" : "opacity-50 cursor-not-allowed"}`}
                buttonText="Save Changes"
              />
            </div>
          </div>
        </Card>
        <Card className="px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mb-4 ">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">Account Balance</h2>
              <div
                className={`text-mf-sybil-500 flex items-center ${isCustom ? "" : "hidden"}`}
              >
                <span className="text-xs">$</span>
                {((user?.credits ?? 0) / CREDIT_PER_DOLLAR).toFixed(2)}
              </div>
            </div>
            <div className="text-xs bg-mf-new-500 p-2 px-4 rounded-sm">
              <span className="text-mf-sybil-500">
                {user?.planRequests ?? 0}
              </span>{" "}
              Total Available Request
            </div>
          </div>
          {isCustom ? (
            <div className="text-4xl justify-self-center pb-8">
              <span className="text-mf-sybil-500 -translate-y-0.25 ">$</span>
              <input
                type="number"
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
                className="w-24 bg-transparent focus:outline-none"
              />
            </div>
          ) : (
            <div className="text-4xl justify-self-center pb-8">
              <span className="text-mf-sybil-500">$</span>
              {((user?.credits || 0) / CREDIT_PER_DOLLAR).toFixed(2)}
            </div>
          )}

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
              disabled={isAddingCredits || purchaseAmount === 0}
              className={`flex items-center justify-center space-x-2 rounded-md px-4 py-2 transition-colors disabled:opacity-50 ${
                isAddingCredits || purchaseAmount === 0
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
          <div className="flex items-center justify-between my-6">
            <h2 className=" text-lg font-medium">Payment Methods</h2>
            <ActionButton
              onClick={handleAddPaymentMethod}
              buttonText="Add Card"
              variant="noir"
              width="md"
              height="md"
            />
          </div>
          <div className="space-y-4">
            {uniquePaymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-mf-gray/10 flex px-6 items-center justify-between rounded-sm p-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-[#1f222E]/30 flex items-center justify-center rounded">
                    <CreditCardIcon className="h-5 w-5 text-mf-sybil-500" />
                  </div>
                  <div className="">•••• •••• •••• {method.last4}</div>
                </div>
                <div className=" text-sm opacity-70">
                  Expires {method.expMonth?.toString().padStart(2, "0")}/
                  {method.expYear?.toString().slice(-2)}
                </div>
                <div className="flex justify-end space-x-2 md:w-23">
                  <button
                    onClick={handleManagePaymentMethods}
                    className=" hover:opacity-70 hover:cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
