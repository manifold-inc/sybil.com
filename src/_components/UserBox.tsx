"use client";

import { ActionButton } from "@/_components/ActionButton";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "./providers";

export default function UserBox() {
  const { status } = useAuth();
  const isLoggedIn = status === "AUTHED";

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <ActionButton
          href="/sign-in"
          buttonText="Log In"
          variant="noir"
          width="sm"
          height="md"
        />
        <ActionButton
          href="/sign-up"
          buttonText="Sign Up"
          width="sm"
          height="md"
        />
      </div>
    );
  }

  return (
    <Link
      href="/settings"
      className="bg-mf-new-800 border border-mf-new-500 flex items-center gap-2 rounded-sm px-4 py-0.75"
    >
      <Image src="/sybil.svg" alt="SYBIL" width={16} height={16} />
      <div className="flex items-baseline gap-2">
        <span className="text-sm">Day</span>
        <span className="text-mf-green-500">{1}</span>
      </div>
    </Link>
  );
}
