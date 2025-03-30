"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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
          <div className="w-[300px] md:w-[600px]">
            <AskBox path={pathname} query={query} />
          </div>
        </div>
        <div className="absolute right-0 hidden pr-8 sm:block">
          <UserBox />
        </div>
      </div>
      <div className="relative mx-auto flex max-w-5xl items-center justify-start gap-4 pr-2 pt-4 sm:px-8 lg:px-36 xl:w-full">
        <Link
          href={`/search?q=${encodeURIComponent(query)}`}
          className={clsx(
            "relative px-0.5",
            pathname.startsWith("/search") &&
              "after:dark:bg-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-mf-green-700",
          )}
        >
          General
        </Link>
        <Link
          href={`/images?q=${encodeURIComponent(query)}`}
          className={clsx(
            "relative px-0.5",
            pathname.startsWith("/images") &&
              "after:dark:bg-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-mf-green-700",
          )}
        >
          Images
        </Link>
        <div className="ml-auto xl:hidden">
          <UserBox />
        </div>
      </div>
    </div>
  );
}
