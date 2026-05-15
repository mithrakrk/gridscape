import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@kavach/types";

// GET /api/patients — list all patients for authenticated account
export async function GET(req: NextRequest) {
  // TODO: Validate session, extract accountId
  // TODO: Query prisma.patientProfile.findMany({ where: { accountId, deletedAt: null } })
  const response: ApiResponse<unknown> = { data: [], error: null };
  return NextResponse.json(response);
}

// POST /api/patients — create a new patient profile
export async function POST(req: NextRequest) {
  // TODO: Validate session, validate request body (name, dateOfBirth required)
  // TODO: Create PatientProfile, log AuditEvent PATIENT_CREATED
  const response: ApiResponse<unknown> = { data: null, error: "Not implemented" };
  return NextResponse.json(response, { status: 501 });
}
