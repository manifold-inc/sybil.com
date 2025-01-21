import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { DiscordLogo } from "@/components/discord-logo";
import { UserBox } from "@/components/navbar";
import { XLogo } from "@/components/x-logo";
import { Path } from "@/constant";
import AskBox from "./_components/AskBox";
import ChromeExtension from "./_components/ChromeExtension";
import ClientUtils from "./_components/ClientUtils";

export default function Home() {
  const trendings = [
    "how tall is a cow",
    "how do you remove an object from an array in javascript",
    "how do I live a meaningful life",
    "where did Sybil's name come from",
    "good food near sxsw",
  ];
  return (
    <div>
      <div className="fixed left-0 right-0 top-0 z-10 flex w-full justify-between gap-2 px-4 pt-2">
        <ChromeExtension />
        <div className="flex-grow" />
        <div className="hidden gap-4 px-2 text-gray-600">
          <a
            className="hover:underline dark:invert"
            href="https://images.sybil.com"
          >
            Image
          </a>
          <a
            className="hover:underline dark:invert"
            href="https://video.sybil.com"
          >
            Video
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={Path.Discord}
            target="_blank"
            className="flex items-center "
          >
            <DiscordLogo className="h-5 w-5 text-gray-50 dark:invert" />
          </Link>
          <Link
            href={Path.Twitter}
            target="_blank"
            className="flex items-center "
          >
            <XLogo className="h-4 w-4 dark:invert" />
          </Link>
          <UserBox />
        </div>
      </div>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        <div className="h-2/6 w-[80%] max-w-2xl">
          <Image
            className="mx-auto h-16 w-full pb-4 dark:hidden"
            alt="Sybil"
            height="180"
            width="360"
            src="/images/SVG/SybilLogo.svg"
          />
          <Image
            className="mx-auto hidden h-16 w-full pb-4 dark:block"
            alt="Sybil"
            height="180"
            width="360"
            src="/images/SVG/SybilLogoTransparentBlueSVG.svg"
          />
          <AskBox autofocus />

          <div className="mt-4">
            <div className="mt-2 flex flex-wrap justify-center">
              {trendings.map((t, i) => {
                return (
                  <Link
                    className="mb-1 mr-4 text-center text-sm hover:underline"
                    key={i}
                    href={Path.HomeWithQuery(t)}
                  >
                    {t}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
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
