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

  const navigationItems = [
    { href: "/models", label: "MODELS" },
    { href: "/plans", label: "PLANS" },
    { href: "/mission", label: "MISSION" },
  ];

  return (
    <div className="fixed top-0 right-0 left-0 z-20 flex h-20 w-full items-center justify-between gap-2 px-6">
      <div className="flex flex-1 justify-start">
        <Link className="flex items-center gap-2" href="/">
          <Image src="/sybil-bg.svg" alt="Sybil" width={32} height={32} />
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="border-mf-new-500 bg-mf-new-800 font-tomorrow text-mf-silver-700 hidden h-12 items-center gap-6 rounded-xl border px-8 transition-colors duration-500 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-saira hover:text-mf-silver-500 transition-colors duration-500 ${
                item.href === "/releases"
                  ? pathname.includes(item.href)
                    ? "text-mf-silver-300"
                    : "text-mf-silver-700"
                  : pathname === item.href
                    ? "text-mf-silver-300"
                    : "text-mf-silver-700"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end">
        {pathname !== "/sign-in" && pathname !== "/sign-up" && <UserBox />}
      </div>
    </div>
  );
}
