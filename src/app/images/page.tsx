import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { NavBar } from "@/components/navbar";
import { Images } from "./ClientPage";

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
  searchParams: { q?: string };
}) {
  if (!searchParams.q) redirect("/");
  return (
    <>
      <NavBar query={searchParams.q} />
      <Images key={searchParams.q} query={searchParams.q} />
    </>
  );
}
