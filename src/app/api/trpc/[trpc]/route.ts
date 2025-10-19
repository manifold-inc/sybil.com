import { type NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { withAxiom, type AxiomRequest } from "next-axiom";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: NextRequest) => {
  const axiomReq = req as unknown as AxiomRequest;
  return withAxiom(() =>
    fetchRequestHandler({
      endpoint: "/api/trpc",
      req: axiomReq,
      router: appRouter,
      createContext: () => createTRPCContext({ req: axiomReq }),
      onError:
        env.NODE_ENV !== "development"
          ? ({ path, error }) => {
              axiomReq.log.error(
                `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
              );
            }
          : ({ path, error }) => {
              console.error(
                `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
              );
            },
    }),
  )(axiomReq);
};

export { handler as GET, handler as POST };
