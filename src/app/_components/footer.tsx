import Link from "next/link";

import ChromeExtension from "./ChromeExtension";

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex w-full justify-between gap-2 bg-mf-ash-700 px-10 py-8 text-mf-milk-700">
      <p className="pl-3">© 2025 Manifold Labs, Inc.</p>
      <div className="flex gap-2">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
        <ChromeExtension />
      </div>
    </div>
  );
}
