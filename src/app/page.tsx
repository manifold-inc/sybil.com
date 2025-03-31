import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Path } from "@/constant";
import AskBox from "./_components/AskBox";
import ClientUtils from "./_components/ClientUtils";

export default function Home() {
  const trendings = [
    "Where did Sybil's name come from?",
    "How do I live a meaningful life?",
    "How tall is a cow?",
  ];
  return (
    <div>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <div className="h-2/6 w-[80%] max-w-2xl">
          <h1 className="text-center text-2xl font-bold">SYBIL</h1>
          <div className="py-8 sm:p-8">
            <AskBox autofocus />
          </div>
          <div className="mt-4">
            <div className="mt-2 flex flex-col items-center justify-center gap-2">
              {trendings.map((t, i) => {
                return (
                  <Link
                    className="mb-1 hover:underline"
                    key={i}
                    href={Path.HomeWithQuery(t)}
                  >
                    <span className="flex items-center gap-2">
                      <Image
                        src="/sybil.svg"
                        alt="sybil"
                        width={12}
                        height={12}
                      />
                      {t}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <ClientUtils />
      </Suspense>
    </div>
  );
}
