/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";

import "@/styles/globals.css";

import dynamic from "next/dynamic";
import { Blinker } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import { Toaster } from "sonner";

import { env } from "@/env.mjs";
import Countdown from "./_components/Countdown";
import FakeFooter from "./_components/FakeFooter";
import FakeHeader from "./_components/FakeHeader";
import Footer from "./_components/footer";
import Header from "./_components/header";
import { WithGlobalProvider } from "./_components/providers";

const blinker = Blinker({
  subsets: ["latin"],
  variable: "--font-blinker",
  display: "swap",
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
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
      className={`${blinker.className} bg-mf-ash-700`}
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body
        className={`${blinker.variable} bg-white h-full bg-mf-ash-700 font-body text-mf-milk-300 transition-colors`}
      >
        <WithGlobalProvider>
          <PostHogPageView />
          {env.RELEASE_FLAG === "true" ? (
            <>
              <FakeHeader />
              <div className="sm:my-auto-0 my-auto flex flex-col items-center justify-center sm:h-screen">
                <h1 className="pb-16 text-xl font-bold text-mf-green-500">
                  THINK BIGGER
                </h1>
                <Countdown />
                <div className="pb-16" />
              </div>
              <FakeFooter />
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
