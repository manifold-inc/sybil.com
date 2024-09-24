/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
const { withAxiom } = await import("next-axiom");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "serpapi.com",
      },
      {
        protocol: "https",
        hostname: "www.micreate.eu",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "s2.googleusercontent.com",
      },
    ],
  },
};

export default withAxiom(config);
