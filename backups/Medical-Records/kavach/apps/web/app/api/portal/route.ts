import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@kavach/types";

// POST /api/portal/request-otp — request OTP for portal access
// Doctor opens link, this triggers OTP to caregiver's phone

// POST /api/portal/verify — verify OTP and start portal session
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, otp } = body;

  if (!token || !otp) {
    return NextResponse.json({ data: null, error: "token and otp required" }, { status: 400 });
  }

  // TODO: Import verifyPortalToken, verifyOtp from @kavach/auth
  // TODO: Verify token (valid, not expired, not revoked)
  // TODO: Verify OTP against stored hash
  // TODO: Create portal session cookie
  // TODO: Log AuditEvent PORTAL_ACCESSED (with IP, no PHI)

  const response: ApiResponse<unknown> = { data: null, error: "Not implemented" };
  return NextResponse.json(response, { status: 501 });
}
