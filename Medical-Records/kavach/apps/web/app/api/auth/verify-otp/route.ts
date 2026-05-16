/**
 * POST /api/auth/verify-otp
 * Body: { phone: string; otp: string }
 *
 * Verifies the OTP for the given phone number.
 * On success: creates an encrypted iron-session cookie and returns ok.
 * On failure: returns an error code. Does NOT reveal PHI in any error.
 *
 * Error codes:
 *   MISSING_FIELDS   — phone or otp missing from body
 *   INVALID_PHONE    — phone cannot be normalised
 *   INVALID_OTP      — OTP is wrong (attempts remaining)
 *   EXPIRED          — OTP has expired; caregiver must request a new one
 *   LOCKED           — Too many failed attempts; caregiver must request a new OTP
 *   NO_OTP           — No pending OTP for this phone (or already verified)
 */

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { verifyCaregiverOtp, normalisePhone } from "@kavach/auth";
import { sessionOptions, type KavachSession } from "@/lib/session";
import { prisma } from "@kavach/db";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { phone, otp } = extractFields(body);

  if (!phone || !otp) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const normalised = normalisePhone(phone);
  if (!normalised) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 422 });
  }

  const result = await verifyCaregiverOtp(phone, otp);

  if (!result.ok) {
    const statusMap: Record<string, number> = {
      INVALID_PHONE: 422,
      NO_OTP: 404,
      EXPIRED: 410,
      INVALID_OTP: 401,
      LOCKED: 429,
    };
    return NextResponse.json(
      { error: result.error },
      { status: statusMap[result.error] ?? 400 }
    );
  }

  // Build response and attach iron-session cookie
  const response = NextResponse.json({ ok: true });

  const session = await getIronSession<KavachSession>(req, response, sessionOptions);
  session.accountId = result.accountId;
  session.phoneNumber = normalised;
  await session.save();

  // Log audit event (non-PHI: just accountId and event type)
  await prisma.auditEvent.create({
    data: {
      accountId: result.accountId,
      eventType: "CAREGIVER_LOGIN",
      actor: result.accountId,
      metadata: { loginMethod: "otp" },
    },
  });

  return response;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractFields(body: unknown): { phone: string | null; otp: string | null } {
  if (body === null || typeof body !== "object") return { phone: null, otp: null };
  const b = body as Record<string, unknown>;
  return {
    phone: typeof b.phone === "string" ? b.phone.trim() : null,
    otp: typeof b.otp === "string" ? b.otp.trim() : null,
  };
}
