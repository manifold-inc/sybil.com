"use client";

import { useEffect } from "react";
import { redirect, useSearchParams } from "next/navigation";

export default function ClientUtils() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      redirect(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [searchParams]);
  return null;
}
