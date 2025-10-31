"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import UserBox from "./UserBox";

export default function Header() {
  const pathname = usePathname();
  if (pathname.includes("/search") || pathname.includes("/images")) {
    return null;
  }
  return (
    <div className="fixed top-0 right-0 left-0 z-20 flex h-20 w-full items-center justify-between gap-2 px-6">
      <div className="flex flex-1 justify-start">
        <Link className="flex items-center gap-2" href="/">
          <Image src="/sybil-bg.svg" alt="Sybil" width={32} height={32} />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end">
        {pathname !== "/sign-in" && pathname !== "/sign-up" && <UserBox />}
      </div>
    </div>
  );
}
