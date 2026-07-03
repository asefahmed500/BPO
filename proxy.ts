import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api/chat/guest",
  "/api/contact",
  "/api/newsletter",
  "/api/socket",
  "/_next",
  "/favicon.ico",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );
  if (isPublic) return NextResponse.next();

  const sessionCookie = request.cookies.get("better-auth.session");
  if (!sessionCookie && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!sessionCookie && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
