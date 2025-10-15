import Link from "next/link";
import { InfoIcon } from "lucide-react";

import ChromeExtension from "./ChromeExtension";

export default function Footer() {
  return (
    <div className="group fixed bottom-0 left-0 right-0 z-20 hidden w-full p-5 sm:block">
      {/* Footer content - hidden by default, shown on hover */}
      <div className="flex w-full items-center justify-between font-poppins text-sm text-mf-silver-700">
        <Link
          href="https://manifold.inc"
          target="_blank"
          className="flex flex-row items-center gap-2"
        >
          <div className="rounded-md border border-mf-new-500 bg-mf-new-800 p-1.5">
            <InfoIcon className="h-4 w-4 text-mf-ash-300 transition-colors duration-700 group-hover:text-mf-green-500" />
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
