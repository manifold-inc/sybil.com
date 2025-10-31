import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export const NumberParameter = ({
  imageName,
  min,
  max,
  step,
  parameterName,
  parameterLabel,
  parameterDescription,
  parameterValue,
  updateParameter,
}: {
  imageName: string;
  min: number;
  max: number;
  step: number;
  parameterName: string;
  parameterLabel: string;
  parameterValue: number;
  parameterDescription: string;
  formatValue?: (value: number) => string;
  updateParameter: (parameterName: string, value: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-1 relative">
      <div className="flex items-center gap-2">
        <div className="bg-mf-ash-700 rounded-md items-center justify-center p-1">
          <Image
            src={imageName}
            alt={parameterName}
            width={16}
            height={16}
            priority
          />
        </div>
        <label
          htmlFor={parameterName}
          className="font-medium text-sm whitespace-nowrap"
        >
          {parameterLabel}
        </label>
        <span className="group">
          <InformationCircleIcon className="w-3 h-3 -translate-x-0.5 cursor-pointer" />
          <span className="absolute left-1/2 -translate-x-1/2 top-8 z-50 hidden w-60 whitespace-normal rounded-sm bg-mf-noir-300 px-2 py-1 text-xs group-hover:block text-center">
            <div className="flex items-center text-left gap-1">
              {parameterDescription}
            </div>
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          id={parameterName}
          type="range"
          min={min}
          max={max}
          step={step}
          value={parameterValue}
          onChange={(e) =>
            updateParameter(parameterName, parseFloat(e.target.value))
          }
          className="flex-1"
          style={
            {
              "--slider-percentage": `${((parameterValue - min) / (max - min)) * 100}%`,
            } as React.CSSProperties
          }
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={parameterValue}
          onChange={(e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value)) value = min;
            value = Math.max(min, Math.min(max, value));
            updateParameter(parameterName, value);
          }}
          onBlur={(e) => {
            let value = parseFloat(e.target.value);
            if (e.target.value === "" || isNaN(value)) {
              value = min;
            } else {
              value = Math.max(min, Math.min(max, value));
            }
            updateParameter(parameterName, value);
          }}
          className={`text-center outline-none rounded-full bg-[#0B0C18] px-2 py-1 text-mf-sally-300 text-sm ${parameterValue > 1000 ? "w-16" : "w-12"}`}
        />
      </div>
    </div>
  );
};
