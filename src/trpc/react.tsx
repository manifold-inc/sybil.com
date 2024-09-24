"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";

export const reactClient = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    reactClient.createClient({
      transformer,
      links: [
        httpBatchLink({
          url: getUrl(),
          headers() {
            return {
              "x-trpc-source": "react",
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <reactClient.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </reactClient.Provider>
    </QueryClientProvider>
  );
}
