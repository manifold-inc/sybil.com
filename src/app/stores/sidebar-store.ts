import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarStore = {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  toggleSidebar: () => void;
};

const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: false,
      setIsExpanded: (isExpanded) => set({ isExpanded }),
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
    }),
    {
      name: "sidebar-store",
    }
  )
);

export default useSidebarStore;
