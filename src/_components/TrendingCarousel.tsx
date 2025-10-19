"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Path } from "@/constant";

interface TrendingCarouselProps {
  trendings: string[];
  intervalMs?: number;
}

export default function TrendingCarousel({
  trendings,
  intervalMs = 5000,
}: TrendingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % trendings.length);
        setIsAnimating(false);
      }, 300);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [trendings.length, intervalMs]);

  return (
    <div className="mt-4">
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="relative h-9 overflow-hidden">
          <Link
            className={`mb-1 transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
            href={Path.HomeWithQuery(trendings[currentIndex] ?? "")}
          >
            <span className="border-mf-new-500 bg-mf-new-700 text-mf-silver-700 hover:text-mf-silver-500 flex items-center gap-2 rounded-xl border px-3 py-1 text-sm transition-colors duration-300">
              <Image src="/sybil.svg" alt="sybil" width={12} height={12} />
              {trendings[currentIndex]}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
