import { type Config } from "tailwindcss";
import animation from "tailwindcss-animated";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      boxShadow: {
        center: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px'
      },
      colors: {
        sblue: {
          200: "#A0C7FE",
        },
        sgray: {
          100: "#EEF0EF",
          500: "#454E59",
          800: "#121417",
        },
        sgreen: {
          200: "#D8FFA4",
          600: "#142900",
        },
      },
      fontFamily: {
        body: ["var(--font-inter)"],
        header: ["var(--font-eczar)"],
      },
    },
  },
  plugins: [
    animation,
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
  darkMode: "class",
} satisfies Config;
