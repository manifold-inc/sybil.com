import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreKey } from "@/constant";

interface ModelState {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    immer((set) => ({
      selectedModel: "deepseek-ai/DeepSeek-R1",
      setSelectedModel: (model) => set({ selectedModel: model }),
    })),
    {
      name: StoreKey.Model,
    }
  )
); 