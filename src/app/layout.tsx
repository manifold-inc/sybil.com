/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";

import "@/styles/globals.css";

import dynamic from "next/dynamic";
import { Poppins, Saira, Tomorrow } from "next/font/google";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import { Toaster } from "sonner";

import { env } from "@/env.mjs";
import Countdown from "./_components/Countdown";
import Footer from "./_components/footer";
import Header from "./_components/header";
import { WithGlobalProvider } from "./_components/providers";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
});

const tomorrow = Tomorrow({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-tomorrow",
  display: "swap",
});

const saira = Saira({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-saira",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sybil.com"),
  title: "Sybil",
  description: "Reshape your search",
  icons: [{ rel: "icon", url: "/sybil-bg.svg" }],
  openGraph: {
    title: "Sybil",
    description: "Reshape your search",
    images: [
      {
        url: "/sybil-preview.png",
        width: 1200,
        height: 630,
        alt: "Sybil",
      },
    ],
  },
  // For iMessage/SMS previews
  twitter: {
    card: "summary_large_image",
    title: "Sybil",
    description: "Reshape your search",
    images: ["/sybil-preview.png"],
  },
};

const PostHogPageView = dynamic(() => import("./_components/PosthogPageView"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${tomorrow.variable} ${saira.variable} bg-mf-new-900 text-mf-silver-500`}
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body className="font-body">
        <WithGlobalProvider>
          <PostHogPageView />
          {env.NEXT_PUBLIC_RELEASE_FLAG === "true" ? (
            <>
              <div className="my-auto-0 my-auto flex h-screen flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src="/sybil-bg.svg"
                    alt="Sybil"
                    width={30}
                    height={30}
                  />
                  <Image
                    src="/sybil-text.svg"
                    className="pt-1"
                    alt="Sybil"
                    width={90}
                    height={30}
                  />
                </div>
                <div className="pb-16" />
                <Countdown />
                <div className="pb-16" />
              </div>
            </>
          ) : (
            <>
              <Header />
              {children}
              <Footer />
            </>
          )}
        </WithGlobalProvider>
      </body>
      <Toaster />
      <Analytics />
      <AxiomWebVitals />
    </html>
  );
}
