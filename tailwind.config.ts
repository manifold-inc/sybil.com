import { type Config } from "tailwindcss";
import animation from "tailwindcss-animated";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      boxShadow: {
        center: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
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
        body: ["var(--font-poppins)"],
        tomorrow: ["var(--font-tomorrow)"],
        saira: ["var(--font-saira)"],
        poppins: ["var(--font-poppins)"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
    colors: {
      mf: {
        new: {
          500: "#1E1F26",
          600: "#1A1B20",
          700: "#15161B",
          800: "#14151A",
          900: "#121318",
        },
        safety: {
          300: "#FF9B7A",
          500: "#FF8159",
          700: "#D96547",
        },
        ash: {
          300: "#3A3C46",
          500: "#22242E",
          700: "#17181F",
        },
        night: {
          300: "#2A2C33",
          500: "#191B20",
          700: "#101114",
        },
        silver: {
          300: "#E1E5EB",
          500: "#C5DBFF",
          700: "#A3B5D6",
        },
        milk: {
          100: "#e6f0ff",
          300: "#E0EBFF",
          500: "#D7E5FF",
          700: "#AEC0D6",
        },
        blue: {
          300: "#AAD6FF",
          500: "#7BC1FF",
          700: "#52ABFF",
          900: "#225d94",
        },
        green: {
          100: "#B1FADF",
          500: "#57E8B4",
          700: "#37c492",
          900: "#15382c",
        },
        red: "#FF5A5A",
        grey: "#8997ad",
        gray: "#98A1B2",
        white: "#f2f7ff",
        "gray-600": "#475467",
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
