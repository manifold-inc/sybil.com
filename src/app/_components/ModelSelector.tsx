"use client";

import { useMemo, useState } from "react";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { reactClient as api } from "@/trpc/react";

export default function ModelSelector() {
  const { data: models, isLoading } = api.model.getAll.useQuery();
  const [selectedModel, setSelectedModel] =
    useState<string>("Loading models...");

  useMemo(() => {
    if (models && models.length > 0) {
      setSelectedModel(models[0]?.model ?? "Loading models...");
    }
  }, [models]);

  return (
    <div className="w-42 sm:w-fit">
      <Listbox value={selectedModel} onChange={setSelectedModel}>
        <div className="relative">
          <Listbox.Button className="w-42 flex items-center justify-between overflow-hidden rounded-full px-4 py-2 font-semibold text-mf-milk-700 hover:text-mf-milk-500 sm:w-full">
            {({ open }) => (
              <>
                <div
                  className={clsx(
                    "flex min-w-0 items-center gap-2",
                    open && "w-42 sm:w-72",
                  )}
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-mf-green-700" />
                  <span className="truncate">
                    {isLoading
                      ? "Loading models..."
                      : selectedModel?.split("/").pop() ?? selectedModel}
                  </span>
                </div>
                {open ? (
                  <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0 text-mf-green-700" />
                ) : (
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 text-mf-green-700" />
                )}
              </>
            )}
          </Listbox.Button>

          <Listbox.Options className="bg-white dark:border-mf-ash-600 absolute right-0 z-[100] mt-2 w-full rounded-xl py-2 shadow-lg focus:outline-none dark:bg-mf-ash-700">
            {models?.map((model) => (
              <Listbox.Option
                key={model.model}
                value={model.model}
                className={({ selected }) =>
                  clsx(
                    "relative m-2 cursor-pointer select-none rounded-full px-4 py-1.5",
                    selected && "ring-1 ring-mf-green-700",
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-mf-green-700" />
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
