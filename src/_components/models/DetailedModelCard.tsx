import { showTargonToast } from "@/_components/TargonToast";
import { api } from "@/trpc/react";
import { formatNumber } from "@/utils/utils";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import {
  SparklesIcon,
  Square2StackIcon as Square2StackIconSolid,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const DetailedModelCard = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const companyLogos: Record<string, string> = {
    openai: "/openai.svg",
    "deepseek-ai": "/deepseek.svg",
    moonshotai: "/moonshot.svg",
    qwen: "/qwen.svg",
    "zai-org": "/zai.svg",
  };
  const companyName = (name: string) => {
    return name.split("/")[0]?.toLowerCase();
  };

  const key = companyName(name) ?? "";
  const companyLogo = key in companyLogos ? companyLogos[key] : "";

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
    <Link
      href={`/models/${name}`}
      className="bg-mf-card-dark flex flex-col gap-2 rounded-sm sm:p-4 p-2 duration-200 hover:opacity-90 relative border border-mf-metal-300"
    >
      {/* Copy and Bookmark buttons - Top Right */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          onClick={handleCopyModel}
          className="p-1 cursor-pointer hover:opacity-90"
          title="Copy Model Name"
        >
          {isCopied ? (
            <Square2StackIconSolid className="h-4 w-4" />
          ) : (
            <Square2StackIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-mf-background rounded-sm p-1">
          {companyLogo ? (
            <div className="h-3 w-3 sm:h-4 sm:w-4 items-center justify-center flex">
              <Image
                src={companyLogo}
                alt={`${companyName(name)} Logo`}
                height={16}
                width={16}
                className="hidden sm:block"
                priority
              />
              <Image
                src={companyLogo}
                alt={`${companyName(name)} Logo`}
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
        <span className="truncate pb-0.5 text-md font-semibold pr-12">
          {parseName(name)}
        </span>
      </div>

      <div className=" line-clamp-3 text-xs sm:h-15 mb-2">
        {description.split(". ")[0] + (description.includes(". ") ? ". " : "")}
      </div>

      <div className="hidden sm:flex mb-0.5 gap-2 justify-between text-xs">
        <div className="flex flex-row gap-2">
          <div className="bg-mf-noir-300/50 whitespace-nowrap w-24 flex items-center justify-center rounded-sm px-2 sm:py-0.5 py-0">
            <span className="font-poppins text-2xs">
              <span className="text-mf-sally-500">
                ${((costs?.[0]?.icpt ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-mf-edge-500"> In</span>
              <span className="text-mf-sally-500">
                {" "}
                ${((costs?.[0]?.ocpt ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-mf-edge-500"> Out</span>
            </span>
          </div>
          <div className="bg-mf-noir-300/50 whitespace-nowrap w-20 flex items-center justify-center rounded-sm px-2 sm:py-0.5 py-0">
            <span className="font-poppins text-2xs">
              <span className="text-mf-sally-500">
                {info?.context_length
                  ? formatNumber(info.context_length)
                  : "N/A"}
              </span>
              <span className="text-mf-edge-500"> Context</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
