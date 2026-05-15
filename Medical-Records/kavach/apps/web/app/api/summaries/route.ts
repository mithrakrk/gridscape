import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@kavach/types";

// POST /api/summaries — generate a doctor summary for a patient
export async function POST(req: NextRequest) {
  // TODO: Validate session, validate body { patientId }
  // TODO: Verify patientId belongs to accountId (authorization)
  // TODO: Call LlmSummaryGenerator.generateSummary(patientId)
  // TODO: Call generateDoctorSummaryPdf(summary, patientId)
  // TODO: Create SummaryArtifact record
  // TODO: Return PDF URL
  const response: ApiResponse<unknown> = { data: null, error: "Not implemented" };
  return NextResponse.json(response, { status: 501 });
}
