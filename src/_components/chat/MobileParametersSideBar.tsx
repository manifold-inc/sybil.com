"use client";

import { PlaygroundParameters } from "@/_components/chat/PlaygroundParameters";
import { useRef } from "react";

export const MobileParametersSideBar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const hasSetOverflow = useRef(false);

  // Prevent background content scrolling when the drawer is open
  if (isOpen && !hasSetOverflow.current) {
    document.body.style.overflow = "hidden";
    hasSetOverflow.current = true;
  } else if (!isOpen && hasSetOverflow.current) {
    document.body.style.overflow = "unset";
    hasSetOverflow.current = false;
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-20 w-full h-full lg:hidden overflow-y-auto no-scrollbar bg-mf-noir-500/50">
      <div className="h-full w-full pt-16">
        <PlaygroundParameters closeSidebar={onClose} />
      </div>
    </div>
  );
};
