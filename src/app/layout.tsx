/* eslint-disable @next/next/no-sync-scripts */
import type { Metadata } from "next";

import "@/styles/globals.css";

import dynamic from "next/dynamic";
import { Blinker, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import { Toaster } from "sonner";

import Footer from "./_components/footer";
import Header from "./_components/header";
import { WithGlobalProvider } from "./_components/providers";

const blinker = Blinker({
  subsets: ["latin"],
  variable: "--font-blinker",
  display: "swap",
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
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
      className={`${blinker.className} bg-mf-new-900`}
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>

      <body
        className={`${blinker.variable} ${poppins.variable} bg-white h-full font-body text-mf-silver-500 transition-colors`}
      >
        <WithGlobalProvider>
          <PostHogPageView />
          <Header />
          {children}
          <Footer />
        </WithGlobalProvider>
      </body>
      <Toaster />
      <Analytics />
      <AxiomWebVitals />
    </html>
  );
}
