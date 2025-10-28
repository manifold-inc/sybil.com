import type { GetModalityModels } from "@/constant";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  model: GetModalityModels;
  textParameters: PlaygroundTextParameters;
  setModel: (model: GetModalityModels) => void;
  updateTextParameter: <K extends keyof PlaygroundTextParameters>(
    key: K,
    value: PlaygroundTextParameters[K]
  ) => void;
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
      model: {
        id: 0,
        name: null,
        description: "",
        modality: "text-to-text",
        supportedEndpoints: [],
        enabled: true,
        allowedUserId: null,
      },
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
