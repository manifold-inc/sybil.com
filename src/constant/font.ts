import { JetBrains_Mono } from "next/font/google";

const JetBrainsMonoFont = JetBrains_Mono({
  subsets: ["cyrillic-ext"],
  variable: "--font-default",
  display: "swap",
});

export const DefaultFont = JetBrainsMonoFont;
