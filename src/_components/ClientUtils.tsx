"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

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
