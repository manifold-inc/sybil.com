"use client";

import { Card } from "@/_components/Card";
import { CREDIT_PER_DOLLAR } from "@/constant";
import { reactClient } from "@/trpc/react";
import {
  ArrowPathIcon,
  CreditCardIcon,
  PencilIcon,
  PlusIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export function BillingSettings() {
  const { data: user } = reactClient.account.getUser.useQuery();
  const { data: paymentMethodsData } =
    reactClient.stripe.getPaymentMethods.useQuery();

  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  const createCheckoutSession =
    reactClient.stripe.createCheckoutSession.useMutation({
      onSuccess: (data) => {
        if (data.url) window.location.href = data.url;
      },
    });

  const getBillingPortal = reactClient.stripe.getBillingPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const createSetupSession = reactClient.stripe.createSetupSession.useMutation({
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
      >
        <Card>
          <h2 className="mb-4 text-lg font-medium">Account Balance</h2>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <WalletIcon className="h-6 w-6 opacity-70" />
                <div>
                  <div className="text-3xl font-light">
                    {formatCurrency((totalCredits || 0) / CREDIT_PER_DOLLAR)}
                  </div>
                  <div className="text-sm opacity-70">Available credits</div>
                </div>
              </div>
            </div>
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
                    ? "bg-mf-white text-black"
                    : "bg-mf-gray/10 border-mf-gray/10 hover:bg-mf-gray/20 border"
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
                  ? "bg-mf-white text-black"
                  : "bg-mf-gray/10 border-mf-gray/10 hover:bg-mf-gray/20 border"
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
                  : "bg-mf-sally-500 border-mf-sally-500 text-mf-ash-700"
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
                <span className="text-mf-sally-500 -translate-y-0.25 text-2xl">
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
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <h2 className="mb-4 text-lg font-medium">Payment Methods</h2>
          <div className="space-y-4">
            {uniquePaymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-mf-gray/10 border-mf-gray/10 flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-mf-gray/10 flex h-8 w-12 items-center justify-center rounded">
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
