import { api } from "@/trpc/react";
import { formatNumber } from "@/utils/utils";
import { useState } from "react";

export function ModelTags({ org, name }: { org: string; name: string }) {
  const { data: info } = api.model.getModelInfo.useQuery({
    modelName: `${org}/${name}`,
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
          onMouseEnter={() => setShowCanceledTooltip(true)}
          onMouseLeave={() => setShowCanceledTooltip(false)}
          onClick={() => setShowCanceledTooltip(!showCanceledTooltip)}
        >
          <p className="text-xs">{org}</p>
        </div>

        {showCanceledTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-40 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className=" text-center">Organization</div>
          </div>
        )}
      </div>
      <div className="relative w-full">
        <div
          className={`
            flex
            flex-1 h-7.5 gap-1
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
            {formatNumber(info?.context_length ?? 0)}
          </p>
          <p className="text-xs">Context</p>
        </div>

        {showInputTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-40 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className="text-center">Context length</div>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <div
          className={`
            flex
            flex-1 h-7.5 gap-1
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
            {formatNumber(info?.max_output_tokens ?? 0)}
          </p>
          <p className="text-xs">Max Out</p>
        </div>

        {showOutputTooltip && (
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full z-50 mt-1 w-44 whitespace-normal rounded-sm border border-mf-ash-300 bg-mf-night-500 px-2 py-1 text-xs">
            <div className=" text-center">Max output tokens</div>
          </div>
        )}
      </div>
    </div>
  );
}
