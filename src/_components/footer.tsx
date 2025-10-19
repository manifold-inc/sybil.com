import Link from "next/link";
import { InfoIcon } from "lucide-react";

import ChromeExtension from "./ChromeExtension";

export default function Footer() {
  return (
    <div className="group fixed right-0 bottom-0 left-0 z-20 hidden w-full p-5 sm:block">
      {/* Footer content - hidden by default, shown on hover */}
      <div className="font-poppins text-mf-silver-700 flex w-full items-center justify-between text-sm">
        <Link
          href="https://manifold.inc"
          target="_blank"
          className="flex flex-row items-center gap-2"
        >
          <div className="border-mf-new-500 bg-mf-new-800 rounded-md border p-1.5">
            <InfoIcon className="text-mf-ash-300 group-hover:text-mf-green-500 h-4 w-4 transition-colors duration-700" />
          </div>
          <p className="opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            Manifold Labs, Inc.
          </p>
        </Link>
        <div className="flex gap-2 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <ChromeExtension />
        </div>
      </div>
    </div>
  );
}
