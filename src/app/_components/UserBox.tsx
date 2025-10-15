"use client";

import Image from "next/image";

import { ActionButton } from "@/app/_components/ActionButton";
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
      href="/sign-out"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-mf-green-500"
    >
      <Image src="/user.svg" alt="SYBIL" width={16} height={16} />
    </a>
  );
}
