import { NavBar } from "@/_components/navbar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Thread from "./ClientPage";

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return {
    title: searchParams.q,
  };
}

export default async function Page(props: {
  searchParams: Promise<{ q?: string; followup?: string }>;
}) {
  const searchParams = await props.searchParams;
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
