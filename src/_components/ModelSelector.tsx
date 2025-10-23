"use client";

import usePlaygroundStore, {
  type PlaygroundModel,
} from "@/app/stores/playground-store";
import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";

const MODEL_OPTIONS: {
  name: string;
  logo: string;
  fullName: string;
  org: string;
  description: string;
}[] = [
  {
    name: "deepseek-ai/DeepSeek-V3",
    logo: "/deepseek.svg",
    fullName: "deepseek-ai/DeepSeek-V3",
    org: "deepseek-ai",
    description: "DeepSeek's V3 model",
  },
  {
    name: "hone",
    logo: "/hone.svg",
    fullName: "hone/hone-chat",
    org: "hone",
    description: "Hone's Chat model",
  },
  {
    name: "moonshot",
    logo: "/moonshot.svg",
    fullName: "moonshot/moonshot-v1",
    org: "moonshot",
    description: "Moonshot's v1 model",
  },
  {
    name: "openai",
    logo: "/openai.svg",
    fullName: "openai/gpt-4",
    org: "openai",
    description: "OpenAI's GPT-4 model",
  },
  {
    name: "qwen",
    logo: "/qwen.svg",
    fullName: "qwen/qwen-turbo",
    org: "qwen",
    description: "Qwen's Turbo model",
  },
  {
    name: "zai-org",
    logo: "/zai.svg",
    fullName: "zai-org/GLM-4.6-FP8",
    org: "zai-org",
    description: "GLM 4.6 FP8 model",
  },
];

function getModelLogo(modelName: string): string {
  const modelLower = modelName.toLowerCase().split("/")[0];

  if (modelLower === "deepseek-ai") return "/deepseek.svg";
  if (modelLower === "hone") return "/hone.svg";
  if (modelLower === "moonshot") return "/moonshot.svg";
  if (modelLower === "openai") return "/openai.svg";
  if (modelLower === "qwen") return "/qwen.svg";
  if (modelLower === "zai-org") return "/zai.svg";

  return "/sybil-dark.svg"; // default fallback
}

export default function ModelSelector() {
  const { model, setModel } = usePlaygroundStore();
  const [isHovering, setIsHovering] = useState(false);
  const [blockHover, setBlockHover] = useState(false);

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
          src={isHovering ? "/selector.svg" : getModelLogo(model.name)}
          alt="Model Logo"
          width={16}
          height={16}
          className="h-4 w-4 flex-shrink-0"
        />
      </div>

      {/* Surrounding model logos */}
      {isHovering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {MODEL_OPTIONS.map((modelOption, index) => {
            const angle = index * 60 - 90;
            const radius = 50;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <button
                key={modelOption.name}
                onClick={() => {
                  const newModel: PlaygroundModel = {
                    id: index,
                    name: modelOption.fullName,
                    org: modelOption.org,
                    description: modelOption.description,
                    modality: "text-to-text",
                    supportedEndpoints: ["CHAT"],
                    enabled: true,
                    allowedUserId: null,
                  };
                  setModel(newModel);
                  setIsHovering(false);
                  setBlockHover(true);
                  setTimeout(() => setBlockHover(false), 300);
                }}
                className={clsx(
                  "animate-in fade-in zoom-in pointer-events-auto absolute flex items-center justify-center rounded-full border transition-all duration-200",
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
                  src={modelOption.logo}
                  alt={modelOption.name}
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 flex-shrink-0"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
