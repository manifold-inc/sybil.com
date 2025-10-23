"use client";

import { ActionButton } from "@/_components/ActionButton";
import { useAuth } from "@/_components/providers";
import { APIKeysSettings } from "@/_components/settings/APIKeysSettings";
import { BillingSettings } from "@/_components/settings/BillingSettings";
import { showTargonToast } from "@/_components/TargonToast";
import { CreditCardIcon, KeyIcon } from "@heroicons/react/24/solid";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";
import { useState } from "react";

type SettingsTab = "api-keys" | "billing";

export default function SettingsPage() {
  const { status } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("billing");

  if (status === "UNAUTHED") {
    showTargonToast("Please sign in to continue", "Sign In", "/sign-in");
    redirect("/sign-in");
  }

  const tabs = [
    {
      id: "billing" as const,
      label: "Billing",
      icon: CreditCardIcon,
    },
    {
      id: "api-keys" as const,
      label: "API Keys",
      icon: KeyIcon,
    },
  ];

  return (
    <div className="no-scrollbar min-h-screen py-6 sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mt-24 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-8 h-8 text-mf-sybil-300" />
            <h1 className="font-saira text-3xl">Settings</h1>
          </div>
          <ActionButton
            href="mailto:devs@manifold.inc"
            buttonText="Support"
            variant="noir"
            width="md"
            className="bg-mf-ash-700 border-none"
            height="md"
          />
        </div>

        {/* Tabs */}
        <div className="mb-8 flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border border-mf-new-500 cursor-pointer rounded-md relative flex items-center justify-center space-x-2 w-46 px-4 py-2 transition-colors ${
                  activeTab === tab.id
                    ? "bg-mf-new-700"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    activeTab === tab.id
                      ? "text-mf-sybil-300"
                      : "text-mf-ash-300"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "api-keys" && <APIKeysSettings />}
          {activeTab === "billing" && <BillingSettings />}
        </motion.div>
      </motion.div>
    </div>
  );
}
