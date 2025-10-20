import { cache } from "react";
import { cookies } from "next/headers";
import { Google } from "arctic";
import { Lucia, type Session, type User } from "lucia";

import { env } from "@/env.mjs";
import { adapter } from "@/schema/db";

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    id: number;
    pubId: string | null;
    email: string | null;
    role: "USER" | "ADMIN";
  }
}

export const lucia = new Lucia(adapter, {
  getUserAttributes: (a) => {
    return {
      id: a.id,
      pubId: a.pubId,
      email: a.email,
      role: a.role,
    };
  },
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: env.NODE_ENV === "production",
    },
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

export const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session?.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    // Probably trying to set during page rendering, can safely swallow
    // eslint-disable-next-line no-console
    console.error("Failed to set session cookie");
  }
  return result;
};
export const validateRequest = cache(uncachedValidateRequest);
