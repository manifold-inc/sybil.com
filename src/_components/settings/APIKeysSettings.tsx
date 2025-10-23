"use client";

import { ActionButton } from "@/_components/ActionButton";
import { Card } from "@/_components/Card";
import { showTargonToast } from "@/_components/TargonToast";
import { api } from "@/trpc/react";
import { copyToClipboard } from "@/utils/utils";
import {
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  Square2StackIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  CodeBracketSquareIcon,
  ExclamationCircleIcon,
  KeyIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  Square2StackIcon as Square2StackIconSolid,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useState } from "react";

export function APIKeysSettings() {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const { data: keys, isLoading } = api.apiKey.listApiKeys.useQuery();
  const utils = api.useUtils();

  const getCurlCode = () => {
    return `curl -X GET \\
  https://api.sybil.com/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
  };

  const formatDateDots = (
    dateInput: Date | string | number | null | undefined
  ) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}.${dd}.${yy}`;
  };

  const createApiKey = api.apiKey.createApiKey.useMutation({
    onSuccess: () => {
      void utils.apiKey.listApiKeys.invalidate();
      showTargonToast("API key created successfully");
    },
    onError: (error) => {
      showTargonToast(error.message || "Failed to create API key", "error");
    },
  });

  const deleteApiKey = api.apiKey.deleteApiKey.useMutation({
    onSuccess: () => {
      void utils.apiKey.listApiKeys.invalidate();
      showTargonToast("API key deleted");
    },
    onError: (error) => {
      showTargonToast(error.message || "Failed to delete API key", "error");
    },
  });

  const updateApiKeyName = api.apiKey.updateApiKeyName.useMutation({
    onSuccess: () => {
      void utils.apiKey.listApiKeys.invalidate();
      showTargonToast("API key name updated");
    },
    onError: (error) => {
      showTargonToast(error.message || "Failed to update API key", "error");
    },
  });

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    showTargonToast("Copied to clipboard");
    setIsCopied(copy);
    setTimeout(() => {
      setIsCopied(null);
    }, 2000);
  };

  const maskApiKey = (key: string) => {
    if (!key) return "••••••••••••••••••••••••••••••••••••";
    const prefix = key.substring(0, 7);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${"•".repeat(10)}${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <KeyIcon className="h-5 w-5 text-mf-sybil-500" />
              <h2 className="text-lg font-medium">API Keys</h2>
            </div>
            <ActionButton
              onClick={() => createApiKey.mutate()}
              disabled={createApiKey.isLoading}
              width="md"
              height="sm"
              variant="noir"
              className="bg-mf-ash-500 text-mf-sybil-500 hover:opacity-70"
              icon={
                createApiKey.isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon
                    className="h-4 w-4 -translate-x-0.5"
                    strokeWidth={2.5}
                  />
                )
              }
              buttonText={
                createApiKey.isLoading ? "Creating..." : "Create New Key"
              }
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="h-6 w-6 animate-spin opacity-70" />
            </div>
          ) : !keys || keys.length === 0 ? (
            <div className="py-12 text-center">
              <p className="opacity-70">No API keys yet</p>
              <p className="mt-1 text-sm opacity-70">
                Create your first API key to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((apiKey, index) => (
                <motion.div
                  key={apiKey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-mf-new-700 rounded p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {editingKey === apiKey.id ? (
                          <input
                            className="bg-mf-gray/10 focus:ring-mf-sally-500 rounded-md px-2 py-1 focus:ring-1 focus:outline-none"
                            value={editedNames[apiKey.id] ?? apiKey.name ?? ""}
                            onChange={(e) =>
                              setEditedNames((names) => ({
                                ...names,
                                [apiKey.id]: e.target.value,
                              }))
                            }
                            onBlur={() => {
                              if (
                                (editedNames[apiKey.id] ?? apiKey.name) !==
                                apiKey.name
                              ) {
                                updateApiKeyName.mutate({
                                  apiKey: apiKey.id,
                                  name: editedNames[apiKey.id] ?? "",
                                });
                              }
                              setEditingKey(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="text-sm font-medium">
                              {apiKey.name ?? "API Key"}
                            </span>
                            <button
                              onClick={() => {
                                setEditingKey(apiKey.id);
                                setEditedNames((names) => ({
                                  ...names,
                                  [apiKey.id]: apiKey.name ?? "",
                                }));
                              }}
                              className="hover: opacity-70"
                            >
                              <PencilSquareIcon className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-mf-sybil-500">
                      Created {formatDateDots(apiKey.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          deleteApiKey.mutate({ apiKey: apiKey.id })
                        }
                        disabled={deleteApiKey.isLoading}
                        className="p-1 text-mf-safety-300 hover:opacity-70"
                      >
                        {deleteApiKey.isLoading ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-mf-new-500 justify-between flex items-center rounded-sm p-2 font-mono text-xs">
                    {showKey === apiKey.id ? apiKey.id : maskApiKey(apiKey.id)}

                    <div className="flex items-center text-mf-sybil-500">
                      <button
                        onClick={() =>
                          setShowKey(showKey === apiKey.id ? null : apiKey.id)
                        }
                        className="hover: p-1 hover:opacity-70"
                      >
                        {showKey === apiKey.id ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyClipboard(apiKey.id)}
                        className="hover: p-1 opacity-70"
                      >
                        {isCopied === apiKey.id ? (
                          <Square2StackIconSolid className="h-4 w-4" />
                        ) : (
                          <Square2StackIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* API Documentation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <div className="mb-4 flex items-center space-x-3">
            <CodeBracketSquareIcon className="h-5 w-5 text-mf-sybil-500" />
            <h2 className="text-lg font-medium">Quick Start</h2>
          </div>

          <p className="mb-4 text-sm opacity-70">
            Use your API key to authenticate requests to the Targon API.
          </p>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Example Request</div>
              <div className="bg-mf-gray/10 group relative rounded-lg p-4 font-mono text-xs">
                {getCurlCode()
                  .split("\n")
                  .map((line, i) => (
                    <div
                      key={i}
                      className={`pb-2 ${i === 2 ? "text-mf-sally-500" : "text-mf-sybil-500"} ${i > 0 ? "ml-4" : ""}`}
                    >
                      {line}
                    </div>
                  ))}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleCopyClipboard(getCurlCode())}
                    className="p-1 opacity-70 hover:opacity-100"
                  >
                    {isCopied === getCurlCode() ? (
                      <Square2StackIconSolid className="h-4 w-4" />
                    ) : (
                      <Square2StackIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security Best Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <div className="mb-4 flex items-center space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-mf-sybil-500" />
            <h2 className="text-lg font-medium">Security Best Practices</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="bg-mf-sybil-300 mt-1.5 h-1.5 w-1.5 rounded-full" />
              <p className="text-sm opacity-70">
                Never share your API keys in public repositories or client-side
                code
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-mf-sybil-300 mt-1.5 h-1.5 w-1.5 rounded-full" />
              <p className="text-sm opacity-70">
                Rotate your keys regularly and delete unused ones
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="bg-mf-sybil-300 mt-1.5 h-1.5 w-1.5 rounded-full" />
              <p className="text-sm opacity-70">
                Use scoped keys with minimal permissions for each use case
              </p>
            </div>
          </div>

          <div className="bg-mf-safety-500/5 border-mf-safety-500/50 mt-4 rounded-lg border p-3">
            <div className="flex items-start space-x-2">
              <ExclamationCircleIcon className="text-mf-safety-500 h-4 w-4" />
              <div className="text-mf-safety-500 text-xs">
                If you suspect a key has been compromised, delete it immediately
                and create a new one.
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
