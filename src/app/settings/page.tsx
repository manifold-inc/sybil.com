"use client";

import { ActionButton } from "@/_components/ActionButton";
import { useAuth } from "@/_components/providers";
import { APIKeysSettings } from "@/_components/settings/APIKeysSettings";
import { BillingSettings } from "@/_components/settings/BillingSettings";
import { showTargonToast } from "@/_components/TargonToast";
import { CreditCardIcon, KeyIcon } from "@heroicons/react/24/outline";
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
          <div className="flex flex-col gap-2">
            <h1 className="font-saira mb-2 text-3xl">Settings</h1>
            <p className="text-sm opacity-70">
              Manage your API keys, billing, and account preferences
            </p>
          </div>
          <ActionButton
            href="/sign-out"
            buttonText="Sign Out"
            variant="noir"
            width="sm"
            height="md"
          />
        </div>

        {/* Tabs */}
        <div className="border-mf-gray/10 mb-8 flex space-x-1 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 py-3 transition-colors ${
                  activeTab === tab.id
                    ? "text-mf-sally-500"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="bg-mf-sally-500 absolute right-0 bottom-0 left-0 h-0.5"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
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
