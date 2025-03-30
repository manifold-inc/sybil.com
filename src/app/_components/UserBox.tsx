"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "./providers";

export default function UserBox() {
  const { status } = useAuth();
  const isLoggedIn = status === "AUTHED";

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="whitespace-nowrap rounded-full px-4 py-2 font-semibold text-mf-green-700 hover:bg-mf-green-700/10"
        >
          Log in
        </Link>
        <Link
          href="/create-account"
          className="hover:bg-mf-green-800 whitespace-nowrap rounded-full bg-mf-green-700 px-4 py-2  font-semibold text-mf-ash-700 hover:bg-mf-green-700/80"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mf-green-700">
      <Image src="/user.svg" alt="SYBIL" width={16} height={16} />
    </div>
  );
}
