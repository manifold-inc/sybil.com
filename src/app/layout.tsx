/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";

import "@/styles/globals.css";

import dynamic from "next/dynamic";
import { Eczar, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import { Toaster } from "sonner";

import { WithGlobalProvider } from "./_components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const eczar = Eczar({
  subsets: ["latin"],
  variable: "--font-eczar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sybil",
  description: "Reshape your search",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body
        className={`${inter.variable} ${eczar.variable} h-full bg-white font-body transition-colors dark:bg-sgray-800 dark:text-sgray-100`}
      >
        <WithGlobalProvider>
          <PostHogPageView />
          {children}
        </WithGlobalProvider>
      </body>
      <Toaster />
      <Analytics />
      <AxiomWebVitals />
    </html>
  );
}
