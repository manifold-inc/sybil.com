"use client";

import { NumberParameter } from "@/_components/chat/parameters/NumberParameter";
import { StopParameter } from "@/_components/chat/parameters/StopParameter";
import { ToggleParameter } from "@/_components/chat/parameters/ToggleParameter";
import usePlaygroundStore, {
  type PlaygroundTextParameters,
} from "@/app/stores/playground-store";
import { MODEL_SYSTEM_PROMPT_TOKENS } from "@/constant";
import { api } from "@/trpc/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const PlaygroundParameters = ({
  closeSidebar,
}: {
  closeSidebar: () => void;
}) => {
  const { textParameters, updateTextParameter, model } = usePlaygroundStore();
  const { data: modelData } = api.model.getByNames.useQuery({
    names: [model.name ?? ""],
  });

  const currentModel = modelData?.[0];
  const maxTokens =
    (currentModel?.metadata as { context_length?: number })?.context_length ||
    4096;

  return (
    <div className="flex flex-col gap-3 text-mf-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-mf-noir-500/50 flex items-center gap-2 p-3 px-4">
        <p className="text-mf-white text-md whitespace-nowrap">Parameters</p>
        <button
          className="ml-auto p-1 transition hover:opacity-90 cursor-pointer"
          onClick={() => closeSidebar()}
        >
          <XMarkIcon className="w-5 h-5 text-mf-edge-500" />
        </button>
      </div>

      {/* Parameters */}
      <div className="p-3 flex flex-col gap-5 lg:gap-10 lg:pl-3 pl-5 translate-y-0.25">
        {/* Temperature */}
        <NumberParameter
          imageName="/thermostat.svg"
          min={0}
          max={1}
          step={0.01}
          parameterName="temperature"
          parameterLabel="Temperature"
          parameterDescription="Controls randomness. Lower values make the output more focused and deterministic."
          parameterValue={textParameters.temperature}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Max Tokens */}
        <NumberParameter
          imageName="/hashtag.svg"
          min={1}
          max={maxTokens - MODEL_SYSTEM_PROMPT_TOKENS}
          step={1}
          parameterName="max_tokens"
          parameterLabel="Max Tokens"
          parameterDescription="Controls the maximum number of tokens to generate and in turn the response length."
          parameterValue={textParameters.max_tokens}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Top P */}
        <NumberParameter
          imageName="/percentage.svg"
          min={0}
          max={1}
          step={0.01}
          parameterName="top_p"
          parameterLabel="Top P"
          parameterDescription="Also known as nucleus sampling or 'penalty', this controls the diversity and quality of the responses. It limits the cumulative probability of the most likely tokens. Lower values lead to more constrained responses."
          parameterValue={textParameters.top_p}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Frequency Penalty */}
        <NumberParameter
          imageName="/up-down.svg"
          min={-2}
          max={2}
          step={0.01}
          parameterName="frequency_penalty"
          parameterLabel="Frequency Penalty"
          parameterDescription="Controls the model's tendency to generate repetitive responses. Lower values make the model more likely to repeat information."
          parameterValue={textParameters.frequency_penalty}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Presence Penalty */}
        <NumberParameter
          imageName="/parameters-blue.svg"
          min={-2}
          max={2}
          step={0.01}
          parameterName="presence_penalty"
          parameterLabel="Presence Penalty"
          parameterDescription="Controls the avoidance of specific topics in its responses. Lower values make the model less concerned about preventing those topics."
          parameterValue={textParameters.presence_penalty}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Seed */}
        <NumberParameter
          imageName="/seed.svg"
          min={0}
          max={1000000}
          step={1}
          parameterName="seed"
          parameterLabel="Seed"
          parameterDescription="Change the seed to randomize responses if your getting the same output over and over. Does not guarantee deterministic outputs."
          parameterValue={textParameters.seed}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
        {/* Stop */}
        <StopParameter />

        <ToggleParameter
          imageName="/ellipses-horizontal.svg"
          parameterName="stream"
          parameterLabel="Stream"
          parameterDescription="If toggle on, the model will stream the response. If off, the model will return the entire response at once."
          parameterValue={textParameters.stream}
          updateParameter={(name, value) =>
            updateTextParameter(name as keyof PlaygroundTextParameters, value)
          }
        />
      </div>
    </div>
  );
};
