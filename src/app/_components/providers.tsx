"use client";

import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";
import { ThemeProvider } from "next-themes";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";

import { env } from "@/env.mjs";
import { reactClient, TRPCReactProvider } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";

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
  user: RouterOutputs["main"]["getUser"];
}>({
  refetch: () => null,
  status: "LOADING",
  user: null,
});

const AuthProvider = ({ children }: PropsWithChildren) => {
  const user = reactClient.main.getUser.useQuery();
  const posthog = usePostHog();
  let status: AuthStates = "UNAUTHED";
  if (user.data) status = "AUTHED";
  if (user.isLoading) status = "LOADING";

  useEffect(() => {
    if (user.data) {
      posthog.identify(user.data);
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
        <ThemeProvider attribute="class">
          <TRPCReactProvider>
            <AuthProvider>{props.children}</AuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </PHProvider>
    </div>
  );
}
