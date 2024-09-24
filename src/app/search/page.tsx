import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { NavBar } from "@/components/navbar";
import Thread from "./ClientPage";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Metadata {
  return {
    title: searchParams.q,
  };
}

export default function Page({
  searchParams,
}: {
  searchParams: { q?: string; followup?: string };
}) {
  if (!searchParams.q) redirect("/");
  return (
    <>
      <NavBar query={searchParams.q} />
      <Thread
        key={searchParams.q}
        query={searchParams.q}
        followup={searchParams.followup}
      />
    </>
  );
}
