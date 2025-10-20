import { clone } from "rambda";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreKey } from "@/constant";
import type { ThreadFile } from "@/hooks/file";

export const useClientStore = create(
  persist(
    immer(
      combine(
        {
          tempFiles: [] as ThreadFile[],
          tempFilesAddTime: 0,
        },
        (set, get) => {
          type State = ReturnType<typeof get>;

          return {
            update: (updater: (state: State) => void) => {
              const _state = clone(get());
              updater(_state);
              set(_state);
            },
            getAndClearTempFiles() {
              const MAX_EXPIRE_TIME = 1 * 60 * 1000; // will expire in 1 min
              if (Date.now() - get().tempFilesAddTime >= MAX_EXPIRE_TIME) {
                return [];
              }
              const files = get().tempFiles;
              set({ tempFiles: [] });
              return files;
            },
            addTempFiles(files: ThreadFile[]) {
              set({
                tempFiles: files.filter((v) => v.status === "uploaded"),
                tempFilesAddTime: Date.now(),
              });
            },
          };
        },
      ),
    ),
    {
      name: StoreKey.Client,
    },
  ),
);
