import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { withAxiom, type AxiomRequest } from "next-axiom";

import { db } from "@/schema/db";
import { genId, User } from "@/schema/schema";
import { google, lucia } from "@/server/auth";
import { getPosthog } from "@/server/posthog";

async function handle(req: AxiomRequest): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    cookies().get("google_code_verifier")?.value ?? null;
  if (!code || !storedCodeVerifier || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      const { message, description } = e;
      req.log.error(`[google-callback] Token Error: ${message} ${description}`);
    }
    return new Response(null, { status: 500 });
  }

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  if (!response.ok) {
    req.log.error(`[google-callback] userinfo Error: ${response.status}`);
    return new Response(null, { status: 500 });
  }

  const user = (await response.json()) as GoogleUser;
  const [existing] = await db
    .select()
    .from(User)
    .where(eq(User.googleId, user.sub));
  const userId = existing?.id ?? genId.user();

  const posthog = getPosthog();
  if (!existing) {
    posthog.capture({
      distinctId: userId,
      event: "user-signed-up",
      properties: {
        from: "google",
        email: user.email,
      },
    });
    // New user account
    await db.insert(User).values({
      id: userId,
      email: user.email,
      googleId: user.sub,
    });
  } else {
    posthog.capture({
      distinctId: userId,
      event: "user-signed-in",
      properties: {
        from: "google",
        email: user.email,
      },
    });
  }
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  posthog.flush();
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}

interface GoogleUser {
  sub: string; // unique google identifier
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
  hd: string;
}
export const GET = withAxiom(handle);
