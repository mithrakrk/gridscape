/**
 * apps/web/lib/get-session-account.ts
 * Server-side helper to read the iron-session from a Next.js Server Component
 * or Route Handler. Returns accountId if authenticated, null otherwise.
 *
 * Usage in Server Components:
 *   import { getSessionAccount } from "@/lib/get-session-account";
 *   const accountId = await getSessionAccount();
 *   if (!accountId) redirect("/auth");
 */

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type KavachSession, isAuthenticated } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/**
 * Read session from Next.js cookie store (Server Components / Server Actions).
 * Returns accountId string if authenticated, null if not.
 */
export async function getSessionAccount(): Promise<string | null> {
  // iron-session v8 needs a request/response pair.
  // In Server Components we construct a synthetic pair from the cookie store.
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(sessionOptions.cookieName as string);

  if (!sessionCookie) return null;

  // Build a minimal Request with the session cookie so iron-session can decrypt it
  const mockReq = new NextRequest("http://localhost", {
    headers: { cookie: `${sessionCookie.name}=${sessionCookie.value}` },
  });
  const mockRes = new NextResponse();

  const session = await getIronSession<KavachSession>(mockReq, mockRes, sessionOptions);
  return isAuthenticated(session) ? session.accountId : null;
}
