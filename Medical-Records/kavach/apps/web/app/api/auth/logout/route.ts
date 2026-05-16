/**
 * POST /api/auth/logout
 * Destroys the caregiver iron-session cookie.
 * No body required. Always returns ok: true (idempotent).
 */

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type KavachSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<KavachSession>(req, response, sessionOptions);
  session.destroy();
  return response;
}
