"use client";

import { env } from "@/env.mjs";
import { api, TRPCReactProvider } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  });
}

function PHProvider({ children }: PropsWithChildren) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

type AuthStates = "LOADING" | "AUTHED" | "UNAUTHED";
const AuthContext = createContext<{
  refetch: () => unknown;
  status: AuthStates;
  user: RouterOutputs["account"]["getUser"];
}>({
  refetch: () => null,
  status: "LOADING",
  user: null,
});

const AuthProvider = ({ children }: PropsWithChildren) => {
  const user = api.account.getUser.useQuery();
  const posthog = usePostHog();
  let status: AuthStates = "UNAUTHED";
  if (user.data) status = "AUTHED";
  if (user.isLoading) status = "LOADING";

  useEffect(() => {
    if (user.data) {
      posthog.identify(String(user.data));
      return;
    }
    posthog.reset();
  }, [posthog, user.data]);
  return (
    <AuthContext.Provider
      value={{
        refetch: user.refetch,
        user: user.data ?? null,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return { ...ctx };
};

export function WithGlobalProvider(props: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <PHProvider>
        <TRPCReactProvider>
          <AuthProvider>{props.children}</AuthProvider>
        </TRPCReactProvider>
      </PHProvider>
    </div>
  );
}
