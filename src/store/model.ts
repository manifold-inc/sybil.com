import { StoreKey } from "@/constant";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface ModelState {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    immer((set) => ({
      selectedModel: "zai-org/GLM-4.6-FP8",
      setSelectedModel: (model) => set({ selectedModel: model }),
    })),
    {
      name: StoreKey.Model,
    }
  )
);
