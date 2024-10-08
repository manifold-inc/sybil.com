import { env } from "@/env.mjs";

export const BasePath = "";
export const withBase = (path: string) => `${BasePath}${path}`;

export const Path = {
  Home: withBase("/"),
  HomeWithQuery: (q: string) => withBase(`/?q=${encodeURIComponent(q)}`),
  SignIn: (redirect = withBase("/")) =>
    withBase("/sign-in?redirect=" + encodeURIComponent(redirect)),
  SignUp: withBase("/sign-up"),
  Thread: (id: string) => withBase(`/thread/${id}`),
  ThreadWithQuery: (id: string, query: string) =>
    withBase(`/thread/${id}?q=${encodeURIComponent(query)}`),
  API: {
    Search: `${env.NEXT_PUBLIC_SEARCH_API}/search`,
  },
  Twitter: "https://twitter.com/manifoldlabs",
  Discord: "https://discord.gg/manifold",
};
