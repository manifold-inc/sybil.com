"use client";

import { Chat } from "@/_components/Chat";
import useSidebarStore from "@/app/stores/sidebar-store";
import Image from "next/image";

export default function Home() {
  const { isExpanded } = useSidebarStore();
  return (
    <div>
      <div
        className={`relative flex h-screen w-full flex-col items-center justify-center transition-all duration-300 ease-in-out ${isExpanded ? "ml-30" : "ml-0"}`}
      >
        <div className="h-2/6 w-[80%] max-w-2xl">
          <div className="flex justify-center">
            <Image
              src="/sybil-text.svg"
              alt="Sybil"
              width={80}
              height={50}
              priority
            />
          </div>
          <div className="py-8 sm:p-8">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
