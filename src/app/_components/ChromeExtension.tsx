"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EXT_URL =
  "https://chromewebstore.google.com/detail/sybil-search/cepcnmnlgpjhcmdjmgoadcmlbkhihlof";

export default function ChromeExtension() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const chromeAgent = navigator.userAgent.indexOf("Chrome") > -1;
    if (!chromeAgent) return;
    setShow(true);
  }, []);
  if (!show) return null;
  return (
    <Link
      href={EXT_URL}
      target="_blank"
      className="hidden text-sm text-gray-800 dark:text-gray-200 sm:block"
    >
      Make Sybil Your Default Search Engine
    </Link>
  );
}
