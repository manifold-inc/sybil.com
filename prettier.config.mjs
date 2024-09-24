/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  // Last version that doesn't squash type and value imports
  importOrderTypeScriptVersion: "4.4.0",
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "^[./]",
  ],
  proseWrap: "always", // printWidth line breaks in md/mdx
};

export default config;
