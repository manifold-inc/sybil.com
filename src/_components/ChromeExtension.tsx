"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      className="hidden pr-2 text-mf-silver-700 sm:block"
    >
      Make Sybil Default Search
    </Link>
  );
}
