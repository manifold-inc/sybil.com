"use client";

import { useMemo } from "react";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { useModelStore } from "@/store/model";

export default function ModelSelector({
  search,
  onModelChange,
}: {
  search: boolean;
  onModelChange?: (model: string) => void;
}) {
  // TODO: uncomment this when Targon is ready
  // const { data: models, isLoading } = api.model.getAll.useQuery();

  const { selectedModel: storeModel, setSelectedModel: setStoreModel } =
    useModelStore();

  const models = useMemo(
    () => [
      { model: "deepseek-ai/DeepSeek-R1" },
      { model: "deepseek-ai/DeepSeek-V3" },
    ],
    [],
  );

  const handleModelChange = (model: string) => {
    setStoreModel(model);
    onModelChange?.(model);
  };

  return (
    <div className="w-42 sm:w-fit">
      <Listbox value={storeModel} onChange={handleModelChange}>
        <div className="relative z-[100]">
          <Listbox.Button className="w-42 flex items-center justify-between overflow-hidden rounded-full px-4 py-2 font-semibold text-mf-milk-500 hover:text-mf-milk-700 sm:w-full">
            {({ open }) => (
              <>
                <div
                  className={clsx(
                    "flex min-w-0 items-center gap-2",
                    open && "w-42 sm:w-56",
                  )}
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-mf-green-500" />
                  <span className="truncate">
                    {search
                      ? "Model"
                      : storeModel?.split("/").pop() ?? storeModel}
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
              "bg-white dark:border-mf-ash-600 absolute mt-2 rounded-3xl py-2 shadow-lg focus:outline-none dark:bg-mf-ash-700 sm:right-4",
              search
                ? "no-scrollbar right-20 h-40 translate-x-32 overflow-y-auto dark:overflow-y-auto"
                : "right-2 w-full",
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
                    <span className="block truncate  font-semibold text-mf-milk-500 hover:text-mf-milk-700">
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
