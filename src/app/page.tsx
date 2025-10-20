import AskBox from "@/_components/AskBox";
import ClientUtils from "@/_components/ClientUtils";
import TrendingCarousel from "@/_components/TrendingCarousel";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  const trendings = [
    "How do I live a meaningful life?",
    "Where did Sybil's name come from?",
    "How tall is a cow?",
  ];
  return (
    <div>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <div className="h-2/6 w-[80%] max-w-2xl">
          <div className="flex justify-center">
            <Image src="/sybil-text.svg" alt="Sybil" width={80} height={50} />
          </div>
          <div className="py-8 sm:p-8">
            <AskBox autofocus />
          </div>
          <TrendingCarousel trendings={trendings} />
        </div>
      </div>
      <Suspense fallback={null}>
        <ClientUtils />
      </Suspense>
    </div>
  );
}
