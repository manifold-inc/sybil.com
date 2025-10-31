"use client";

import { Chat } from "@/_components/Chat";
import useSidebarStore from "@/app/stores/sidebar-store";

export default function Home() {
  const { isExpanded } = useSidebarStore();
  return (
    <div>
      <div
        className={`relative flex h-screen w-full flex-col items-center justify-center transition-all duration-300 ease-in-out ${isExpanded ? "sm:ml-30" : "ml-0"}`}
      >
        <div className="py-8 sm:p-8 w-full">
          <Chat />
        </div>
      </div>
    </div>
  );
}
