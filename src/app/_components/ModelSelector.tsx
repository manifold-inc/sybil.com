"use client";

import { useMemo, useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export default function ModelSelector({ 
  search,
  onModelChange,
  selectedModel: initialModel
}: { 
  search: boolean;
  onModelChange?: (model: string) => void;
  selectedModel?: string;
}) {
  // TODO: uncomment this when Targon is ready
  // const { data: models, isLoading } = api.model.getAll.useQuery();
  
  const [selectedModel, setSelectedModel] =
    useState<string>(initialModel ?? "Loading models...");

  const models = useMemo(() => [
    { model: "deepseek-ai/DeepSeek-R1" },
    { model: "deepseek-ai/DeepSeek-V3-0324" },
  ], []);

  useMemo(() => {
    if (initialModel) {
      setSelectedModel(initialModel);
    } else if (models && models.length > 0) {
      const model = models[0]?.model ?? "Loading models...";
      setSelectedModel(model);
      onModelChange?.(model);
    }
  }, [models, onModelChange, initialModel]);

  // Add URL parameter handling
  useEffect(() => {
    // Read initial model from URL if present
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get('m');
    
    if (modelParam) {
      setSelectedModel(modelParam);
      onModelChange?.(modelParam);
    }
  }, [onModelChange]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onModelChange?.(model);

    // Update URL with new model parameter
    const params = new URLSearchParams(window.location.search);
    params.set('m', model);
    
    // Update URL without causing page reload
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return (
    <div className="w-42 sm:w-fit">
      <Listbox value={selectedModel} onChange={handleModelChange}>
        <div className="relative z-[100]">
          <Listbox.Button className="w-42 z-50 flex items-center justify-between overflow-hidden rounded-full px-4 py-2 font-semibold text-mf-milk-700 hover:text-mf-milk-500 sm:w-full">
            {({ open }) => (
              <>
                <div
                  className={clsx(
                    "flex min-w-0 items-center gap-2",
                    open && "w-42 sm:w-72",
                  )}
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-mf-green-500" />
                  <span className="truncate">
                    {search
                        ? "Model"
                        : selectedModel?.split("/").pop() ?? selectedModel}
                  </span>
                </div>
                {open ? (
                  <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0 text-mf-green-500" />
                ) : (
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 text-mf-green-500" />
                )}
              </>
            )}
          </Listbox.Button>

          <Listbox.Options
            className={clsx(
              "bg-white dark:border-mf-ash-600 absolute right-0 mt-2 rounded-3xl py-2 shadow-lg focus:outline-none dark:bg-mf-ash-700",
              search
                ? "no-scrollbar h-40 translate-x-32 overflow-y-auto dark:overflow-y-auto"
                : "w-full",
            )}
          >
            {models?.map((model) => (
              <Listbox.Option
                key={model.model}
                value={model.model}
                className={({ selected }) =>
                  clsx(
                    "relative mx-3 my-1 cursor-pointer select-none rounded-full px-4 py-1.5",
                    selected && "ring-1 ring-mf-green-500",
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-mf-green-500" />
                    <span className="block truncate  font-semibold text-mf-milk-700 hover:text-mf-milk-500">
                      {model.model.split("/").pop()}
                    </span>
                  </div>
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
