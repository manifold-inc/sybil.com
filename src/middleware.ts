import { type NextRequest, NextResponse } from "next/server";

import { uncachedValidateRequest } from "./server/auth";

// Use Node.js runtime instead of Edge Runtime
export const runtime = "nodejs";

// 1. Specify protected and public routes
const protectedRoutes = ["/settings"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // 3. Decrypt the session from the cookie
  const { session } = await uncachedValidateRequest();

  // 4. Redirect to /sign-in if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
