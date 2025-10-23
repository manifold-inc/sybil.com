import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export const ToggleParameter = ({
  imageName,
  parameterName,
  parameterLabel,
  parameterDescription,
  parameterValue,
  updateParameter,
}: {
  imageName: string;
  parameterName: string;
  parameterLabel: string;
  parameterValue: boolean;
  parameterDescription: string;
  updateParameter: (parameterName: string, value: boolean) => void;
}) => {
  return (
    <div className="flex flex-col gap-1 pb-6 relative">
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
            <div className="flex items-center justify-center gap-1">
              {parameterDescription}
            </div>
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3 pt-1.5">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={parameterName}
            checked={parameterValue}
            onChange={(e) => updateParameter(parameterName, e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
              parameterValue ? "bg-mf-sally-300" : "bg-mf-noir-300/50"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-mf-white rounded-full transition-transform duration-200 ease-in-out ${
                parameterValue ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>
        <span className="text-sm font-medium">
          {parameterValue ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
};
