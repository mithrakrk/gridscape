/**
 * apps/web/middleware.ts
 * Next.js Edge Middleware — guards all caregiver-authenticated routes.
 *
 * Protected paths (prefix match):
 *   /(caregiver)/*  — all caregiver dashboard pages
 *   /api/patients   — patient CRUD API
 *   /api/records    — records API
 *   /api/summaries  — summaries API
 *
 * Public paths (no auth required):
 *   /auth           — login / OTP entry page
 *   /api/auth/*     — OTP request, verify, logout
 *   /portal/*       — doctor portal (separate OTP gate in Milestone 3)
 *   /               — landing page
 *
 * On missing/invalid session: redirects to /auth (browser) or returns 401 (API).
 */

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type KavachSession, isAuthenticated } from "@/lib/session";

// Paths that require a valid caregiver session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/patients",
  "/records",
  "/summaries",
  "/settings",
  "/api/patients",
  "/api/records",
  "/api/summaries",
];

// Paths that are explicitly public (bypass auth check)
const PUBLIC_PREFIXES = ["/auth", "/api/auth", "/portal", "/_next", "/favicon", "/public"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow root landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Only enforce auth on protected paths
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Read and validate session
  const res = NextResponse.next();
  const session = await getIronSession<KavachSession>(req, res, sessionOptions);

  if (!isAuthenticated(session)) {
    // API routes return 401 JSON; page routes redirect to /auth
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward accountId as a request header so Route Handlers can read it
  // without decrypting the session again (avoids double decryption).
  const forwardedRes = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers.entries()),
        "x-kavach-account-id": session.accountId,
      }),
    },
  });

  return forwardedRes;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     * iron-session requires the Edge runtime.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
