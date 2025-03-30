"use client";

import { useState } from "react";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { reactClient as api } from "@/trpc/react";

export default function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { data: models, isLoading } = api.model.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0]?.model ?? "");
      }
    },
  });

  return (
    <div className="w-fit py-3 lg:ml-auto lg:py-0">
      <Listbox value={selectedModel} onChange={setSelectedModel}>
        <div className="relative">
          <Listbox.Button className="flex w-full items-center justify-between rounded-full px-4 py-2.5 font-semibold text-mf-milk-700 hover:text-mf-milk-500 lg:px-3 lg:py-2">
            {({ open }) => (
              <>
                <div className="flex min-w-0 items-center gap-2">
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
