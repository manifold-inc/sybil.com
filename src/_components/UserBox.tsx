"use client";

import { ActionButton } from "@/_components/ActionButton";
import Image from "next/image";

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
    <a
      href="/settings"
      className="bg-mf-green-500 flex h-9 w-9 items-center justify-center rounded-full"
    >
      <Image src="/user.svg" alt="SYBIL" width={16} height={16} />
    </a>
  );
}
