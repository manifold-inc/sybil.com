import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useControllerStore = create(
  combine(
    {
      controllers: new Map<string, AbortController>(),
    },
    (set, get) => {
      const methods = {
        insert(threadId: string, controller: AbortController) {
          const controllers = get().controllers;
          controllers.set(threadId, controller);
          set({ controllers });
        },

        stop(threadId: string) {
          const controllers = new Map(get().controllers);
          controllers.get(threadId)?.abort();
          controllers.delete(threadId);
          set({ controllers });
        },

        stopAll() {
          Object.keys(get().controllers).forEach((id) => this.stop(id));
        },

        get(threadId: string) {
          return get().controllers.get(threadId);
        },
      };
      return methods;
    },
  ),
);
