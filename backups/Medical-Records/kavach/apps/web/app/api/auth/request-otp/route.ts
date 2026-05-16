/**
 * POST /api/auth/request-otp
 * Body: { phone: string }
 *
 * Sends a 6-digit OTP to the provided phone number.
 * Creates the Account if it doesn't exist (upsert by phone).
 * In development/test the OTP is returned in the response for testing.
 * In production only a success acknowledgement is returned — no OTP in body.
 *
 * Never expose whether an account already exists (anti-enumeration).
 */

import { NextRequest, NextResponse } from "next/server";
import { requestCaregiverOtp, normalisePhone } from "@kavach/auth";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const phone =
    body !== null &&
    typeof body === "object" &&
    "phone" in body &&
    typeof (body as { phone: unknown }).phone === "string"
      ? (body as { phone: string }).phone.trim()
      : null;

  if (!phone) {
    return NextResponse.json({ error: "MISSING_PHONE" }, { status: 400 });
  }

  const normalised = normalisePhone(phone);
  if (!normalised) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 422 });
  }

  const result = await requestCaregiverOtp(phone);

  if (!result.ok) {
    // Treat INVALID_PHONE as a validation error (already checked above, belt-and-suspenders)
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // In production: do NOT return OTP or accountId in response.
  // In development/test: return _devOtp for API testing without SMS.
  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    ok: true,
    ...(isDev && result._devOtp ? { _devOtp: result._devOtp } : {}),
  });
}
