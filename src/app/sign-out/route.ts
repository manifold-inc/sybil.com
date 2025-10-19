import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { lucia, validateRequest } from "@/server/auth";
import { getPosthog } from "@/server/posthog";

export async function GET(): Promise<Response> {
  const { session } = await validateRequest();
  if (!session) {
    return new Response(null, { status: 400 });
  }
  const posthog = getPosthog();
  posthog.capture({ distinctId: session.userId, event: "user-signed-out" });
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  posthog.flush();
  return redirect("/");
}
