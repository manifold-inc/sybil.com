export const BasePath = "";
export const withBase = (path: string) => `${BasePath}${path}`;

export const Path = {
  Home: withBase("/"),
  SignIn: (redirect = withBase("/")) =>
    withBase("/sign-in?redirect=" + encodeURIComponent(redirect)),
  SignUp: withBase("/sign-up"),
  Settings: withBase("/settings"),
  Twitter: "https://twitter.com/manifoldlabs",
  Discord: "https://discord.gg/manifold",
};
