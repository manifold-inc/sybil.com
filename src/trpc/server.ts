import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";

export const serverClient = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: getUrl(),
      async headers() {
        return {
          cookie: (await cookies()).toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
