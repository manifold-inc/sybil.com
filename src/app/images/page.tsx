import { NavBar } from "@/_components/navbar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Images } from "./ClientPage";

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return {
    title: searchParams.q,
  };
}

export default async function Page(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  if (!searchParams.q) redirect("/");
  return (
    <>
      <NavBar query={searchParams.q} />
      <Images key={searchParams.q} query={searchParams.q} />
    </>
  );
}
