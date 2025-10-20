// @ts-expect-error - no types available
import config from "@manifold-labs/eslint-config-next";

const eslintConfig = [
  ...(config as unknown as unknown[]),
  {
    ignores: ["next-env.d.ts"],
  },
];

export default eslintConfig;
