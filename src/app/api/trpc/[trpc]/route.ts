import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { withAxiom, type AxiomRequest } from "next-axiom";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = withAxiom((req: AxiomRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      env.NODE_ENV !== "development"
        ? ({ path, error }) => {
            req.log.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          },
  }),
);

export { handler as GET, handler as POST };
