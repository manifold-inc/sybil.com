import React from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareBox() {
  return (
    <button
      title="Share Link"
      className="flex h-full flex-col justify-center rounded-md p-1 pr-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700"
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href);
        toast.success("Copied Link!");
      }}
    >
      <Share2 className="h-5 w-5 dark:text-sgray-100" />
    </button>
  );
}
