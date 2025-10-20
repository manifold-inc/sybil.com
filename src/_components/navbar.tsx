"use client";

import AskBox from "@/_components/AskBox";
import UserBox from "@/_components/UserBox";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function NavBar({ query }: { query: string }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 select-none">
      <div className="relative flex items-center justify-center pt-4 pb-2">
        <div className="absolute left-0 hidden sm:block">
          <Link className="flex items-center gap-2 pl-12" href="/">
            <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
            <span className="text-mf-milk-300 text-xl font-semibold">
              SYBIL
            </span>
          </Link>
        </div>
        <div className="flex max-w-5xl items-center justify-center gap-8">
          <div className="w-[340px] md:w-[400px] lg:w-[600px]">
            <AskBox path={pathname} query={query} />
          </div>
        </div>
        <div className="absolute right-0 hidden pr-8 sm:block">
          <UserBox />
        </div>
      </div>
    </div>
  );
}
