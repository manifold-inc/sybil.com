"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ModelSelector from "./ModelSelector";
import UserBox from "./UserBox";

export default function Header() {
  const pathname = usePathname();
  if (pathname.includes("/search") || pathname.includes("/images")) {
    return null;
  }
  return (
    <div className="fixed left-0 right-0 top-0 z-20 flex w-full justify-between gap-2 p-4 sm:p-8">
      {pathname === "/" && <ModelSelector search={false} />}
      {pathname !== "/" && (
        <Link className="flex items-center gap-2" href="/">
          <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
          <span className="text-xl font-semibold text-mf-milk-300">SYBIL</span>
        </Link>
      )}
      <div className="flex-grow" />
      <div className="flex items-center">
        {pathname !== "/sign-in" && pathname !== "/sign-up" && <UserBox />}
      </div>
    </div>
  );
}
