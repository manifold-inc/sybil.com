"use client";

import usePlaygroundStore from "@/app/stores/playground-store";
import type { GetModalityModels } from "@/constant";
import { api } from "@/trpc/react";
import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";

function getModelLogo(modelName: string): string {
  const modelLower = modelName.toLowerCase().split("/")[0];

  if (modelLower === "deepseek-ai") return "/deepseek.svg";
  if (modelLower === "hone") return "/hone.svg";
  if (modelLower === "moonshot") return "/moonshot.svg";
  if (modelLower === "openai") return "/openai.svg";
  if (modelLower === "qwen") return "/qwen.svg";
  if (modelLower === "zai-org") return "/zai.svg";

  return "/sybil.svg"; // default fallback
}

export default function ModelSelector() {
  const { model, setModel } = usePlaygroundStore();
  const [isHovering, setIsHovering] = useState(false);
  const [blockHover, setBlockHover] = useState(false);

  // Fetch models from database
  const { data: modelsData, isLoading } = api.model.getByModality.useQuery({
    modality: "text-to-text",
  });

  // Show loading state or nothing if no models yet
  if (isLoading || !modelsData || modelsData.length === 0) {
    return (
      <div className="relative mr-2">
        <div
          className="border-mf-new-500 bg-mf-new-600 relative flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border transition-colors"
          style={{ zIndex: 20 }}
        >
          <Image
            src={getModelLogo(model?.name ?? "")}
            alt="Model Logo"
            width={16}
            height={16}
            className="h-4 w-4 flex-shrink-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mr-2"
      onMouseLeave={() => {
        setIsHovering(false);
        setBlockHover(false);
      }}
    >
      {/* Expanded hover area - invisible circle (only keeps menu open, doesn't trigger it) */}
      {isHovering && (
        <div
          className="pointer-events-auto absolute rounded-full"
          style={{
            width: "250px",
            height: "250px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            background:
              "radial-gradient(circle, rgba(18, 19, 24, 1) 0%, rgba(18, 19, 24, 0) 70%)",
          }}
        />
      )}

      {/* Center logo */}
      <div
        className={clsx(
          "border-mf-new-500 relative flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border transition-colors",
          isHovering ? "bg-mf-green-500" : "bg-mf-new-600"
        )}
        style={{ zIndex: 20 }}
        onMouseEnter={() => !blockHover && setIsHovering(true)}
      >
        <Image
          src={isHovering ? "/selector.svg" : getModelLogo(model?.name ?? "")}
          alt="Model Logo"
          width={16}
          height={16}
          className="h-4 w-4 flex-shrink-0"
        />
      </div>

      {/* Surrounding model logos */}
      {isHovering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {modelsData.map((dbModel, index) => {
            const metadata = dbModel.metadata as { logo?: string } | null;
            const logo = metadata?.logo ?? getModelLogo(dbModel.name ?? "");
            const modelName = dbModel.name ?? "";
            const org = modelName.split("/")[0] ?? "";

            const angle = index * 60 + 90;
            const radius = 45;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <button
                key={dbModel.id}
                onClick={() => {
                  const newModel: GetModalityModels = {
                    id: dbModel.id,
                    name: modelName,
                    description: dbModel.description ?? "",
                    modality: dbModel.modality,
                    supportedEndpoints: dbModel.supportedEndpoints,
                    enabled: dbModel.enabled,
                    allowedUserId: dbModel.allowedUserId,
                  };
                  setModel(newModel);
                  setIsHovering(false);
                  setBlockHover(true);
                  setTimeout(() => setBlockHover(false), 300);
                }}
                className={clsx(
                  "animate-in fade-in zoom-in pointer-events-auto absolute flex items-center justify-center rounded-full border transition-all duration-200 group",
                  "border-mf-new-500 bg-mf-new-600/80 hover:bg-mf-new-600 hover:scale-110"
                )}
                style={{
                  width: "32px",
                  height: "32px",
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                  animationDelay: `${index * 30}ms`,
                  zIndex: 30,
                }}
              >
                <Image
                  src={logo}
                  alt={org}
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 flex-shrink-0"
                />
                {/* Model name tooltip */}
                <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  <div className="bg-mf-new-600 border border-mf-new-500 rounded px-2 py-1 text-xs">
                    {modelName.split("/")[1]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
