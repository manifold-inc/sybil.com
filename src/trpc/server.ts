import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";

export const serverClient = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        return {
          cookie: cookies().toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
