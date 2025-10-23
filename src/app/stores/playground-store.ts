import type { GetModalityModels } from "@/constant";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlaygroundModel = GetModalityModels & {
  name: string;
  org: string;
};

export type PlaygroundTextParameters = {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  seed: number;
  stop: string[];
  stream: boolean;
};

type PlaygroundStore = {
  model: PlaygroundModel;
  textParameters: PlaygroundTextParameters;
  setModel: (model: PlaygroundModel) => void;
  updateTextParameter: <K extends keyof PlaygroundTextParameters>(
    key: K,
    value: PlaygroundTextParameters[K]
  ) => void;
};

const DEFAULT_MODEL: PlaygroundModel = {
  id: 0,
  name: "deepseek-ai/DeepSeek-V3",
  org: "deepseek-ai",
  description: "DeepSeek's V3 model",
  modality: "text-to-text",
  supportedEndpoints: ["CHAT"],
  enabled: true,
  allowedUserId: null,
};

const DEFAULT_TEXT_PARAMETERS: PlaygroundTextParameters = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  seed: 0,
  stop: [],
  stream: true,
};

const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      model: DEFAULT_MODEL,
      textParameters: DEFAULT_TEXT_PARAMETERS,
      setModel: (model) => set({ model }),
      updateTextParameter: (key, value) =>
        set((state) => ({
          textParameters: {
            ...state.textParameters,
            [key]: value,
          },
        })),
    }),
    {
      name: "playground-store",
    }
  )
);

export default usePlaygroundStore;
