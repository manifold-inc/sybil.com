import { CREDIT_PER_DOLLAR } from "@/constants";
import { api } from "@/trpc/react";
import { formatNumber } from "@/utils/utils";
import { useState } from "react";

export function ModelCosts({ modelName }: { modelName: string }) {
  const { data: costs } = api.model.getCosts.useQuery({
    modelName,
  });

  const [showInputTooltip, setShowInputTooltip] = useState(false);
  const [showOutputTooltip, setShowOutputTooltip] = useState(false);
  const [showCanceledTooltip, setShowCanceledTooltip] = useState(false);

  return (
    <div className="flex gap-2 w-full bg-mf-card-dark rounded-lg p-4 border border-mf-metal-300 h-full items-center">
      <div className="relative w-full">
        <div
          className={`
            flex
            flex-1 h-7.5
            text-sm whitespace-nowrap
            border border-mf-metal-300
            rounded-md
            items-center justify-center
          `}
          onMouseEnter={() => setShowInputTooltip(true)}
          onMouseLeave={() => setShowInputTooltip(false)}
          onClick={() => setShowInputTooltip(!showInputTooltip)}
        >
          <p className="text-mf-sybil-500 text-xs">
            ${((costs?.[0]?.icpt ?? 0) / 100).toFixed(2)}
          </p>
          <p className="text-xs">/M Input</p>
        </div>

        {showInputTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-40 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className=" text-center">Cost per million input tokens</div>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <div
          className={`
            flex
            flex-1 h-7.5
            text-sm whitespace-nowrap
            border border-mf-metal-300
            rounded-md
            items-center justify-center
          `}
          onMouseEnter={() => setShowOutputTooltip(true)}
          onMouseLeave={() => setShowOutputTooltip(false)}
          onClick={() => setShowOutputTooltip(!showOutputTooltip)}
        >
          <p className="text-mf-sybil-500 text-xs">
            ${((costs?.[0]?.ocpt ?? 0) / 100).toFixed(2)}
          </p>
          <p className="text-xs">/M Output</p>
        </div>

        {showOutputTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-44 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className=" text-center">Cost per million output tokens</div>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <div
          className={`
            flex
            flex-1 h-7.5
            text-sm whitespace-nowrap
            border border-mf-metal-300
            rounded-md
            items-center justify-center
          `}
          onMouseEnter={() => setShowCanceledTooltip(true)}
          onMouseLeave={() => setShowCanceledTooltip(false)}
          onClick={() => setShowCanceledTooltip(!showCanceledTooltip)}
        >
          <p className="text-mf-sybil-500 text-xs">
            ${formatNumber((costs?.[0]?.crc ?? 0) / CREDIT_PER_DOLLAR)}
          </p>
          <p className="text-xs">/Cancel</p>
        </div>

        {showCanceledTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-40 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className=" text-center">Cost per canceled request</div>
          </div>
        )}
      </div>
    </div>
  );
}
