import { Card } from "@/_components/Card";
import { showTargonToast } from "@/_components/TargonToast";
import { api } from "@/trpc/react";
import { formatNumber, getModelLogo } from "@/utils/utils";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import {
  SparklesIcon,
  Square2StackIcon as Square2StackIconSolid,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";

export const DetailedModelCard = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const companyLogo = getModelLogo(name);

  const parseName = (name: string) => {
    return name.split("/").pop();
  };

  const handleCopyModel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await navigator.clipboard.writeText(name);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);

    showTargonToast("Model name copied to clipboard");
  };

  const { data: costs } = api.model.getCosts.useQuery({
    modelName: name,
  });

  const { data: info } = api.model.getModelInfo.useQuery({
    modelName: name,
  });

  return (
    <Card link={`/models/${name}`} className="!p-6">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-mf-sybil-500 rounded-sm p-1">
            {companyLogo ? (
              <div className="h-3 w-3 sm:h-4 sm:w-4 items-center justify-center flex">
                <Image
                  src={companyLogo}
                  alt={`${name} Logo`}
                  height={16}
                  width={16}
                  className="hidden sm:block"
                  priority
                />
                <Image
                  src={companyLogo}
                  alt={`${name} Logo`}
                  height={12}
                  width={12}
                  className="block sm:hidden"
                  priority
                />
              </div>
            ) : (
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 flex text-mf-ash-500" />
            )}
          </div>
          <span className="truncate text-sm font-semibold pt-0.5 pr-6">
            {parseName(name)}
          </span>
        </div>
        <button
          onClick={handleCopyModel}
          className="cursor-pointer hover:opacity-90"
          title="Copy Model Name"
        >
          {isCopied ? (
            <Square2StackIconSolid className="h-4.5 w-4.5" />
          ) : (
            <Square2StackIcon className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      <div className=" line-clamp-3 text-xs sm:h-15 mb-2 pt-2">
        {description.split(". ")[0] + (description.includes(". ") ? ". " : "")}
      </div>

      <div className="hidden sm:flex mb-0.5 gap-2 justify-between text-xs">
        <div className="flex flex-row gap-2">
          <div className="bg-mf-noir-300/50 whitespace-nowrap flex items-center justify-center rounded-sm px-2 sm:py-0.5 py-0">
            <span className="font-poppins text-2xs">
              <span className="text-mf-sybil-500">
                ${((costs?.[0]?.icpt ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-mf-edge-500"> In</span>
              <span className="text-mf-sybil-500">
                {" "}
                ${((costs?.[0]?.ocpt ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-mf-edge-500"> Out</span>
            </span>
          </div>
          <div className="bg-mf-noir-300/50 whitespace-nowrap flex items-center justify-center rounded-sm px-2 p-1">
            <span className="font-poppins text-2xs">
              <span className="text-mf-sybil-500">
                {info?.context_length
                  ? formatNumber(info.context_length)
                  : "N/A"}
              </span>
              <span className="text-mf-edge-500"> Context</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
