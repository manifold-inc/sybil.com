/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { withAxiom } from "next-axiom";

import "./src/env.mjs";

/** @type {import("next").NextConfig} */

const config = {
  devIndicators: false,
};

export default withAxiom(config);
