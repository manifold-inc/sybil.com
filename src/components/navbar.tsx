"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AskBox from "@/app/_components/AskBox";
import UserBox from "@/app/_components/UserBox";

export function NavBar({ query }: { query: string }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-10 select-none bg-mf-ash-700">
      <div className="relative flex items-center justify-center border-b border-mf-ash-500 p-8">
        <div className="absolute left-0 hidden sm:block">
          <Link className="flex items-center gap-2 pl-12" href="/">
            <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
            <span className="text-xl font-semibold text-mf-milk-300">
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
