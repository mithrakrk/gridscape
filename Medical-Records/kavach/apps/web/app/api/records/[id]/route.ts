/**
 * GET /api/records/[id]
 * Returns record detail + all extracted fields, account-scoped.
 * Verifies account owns the patient who owns the record.
 * Returns 404 on cross-account access (anti-enumeration).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@kavach/db";
import type { ApiResponse, RecordSummary, ExtractedFieldDto } from "@kavach/types";

type Params = { params: { id: string } };

function accountId(req: NextRequest) {
  return req.headers.get("x-kavach-account-id");
}

export async function GET(req: NextRequest, { params }: Params) {
  const acctId = accountId(req);
  if (!acctId) {
    return NextResponse.json({ data: null, error: "UNAUTHENTICATED" } satisfies ApiResponse<null>, { status: 401 });
  }

  // Join through patient to enforce account scoping
  const record = await prisma.record.findFirst({
    where: {
      id: params.id,
      deletedAt: null,
      patient: { accountId: acctId, deletedAt: null },
    },
    select: {
      id: true,
      recordType: true,
      recordDate: true,
      status: true,
      confidenceScore: true,
      judgeVerified: true,
      manuallyVerified: true,
      correctionNote: true,
      provenance: true,
      rawFileUrl: true,
      createdAt: true,
      patientId: true,
      extractedFields: {
        orderBy: [{ isLowConfidence: "desc" }, { fieldName: "asc" }],
        select: {
          id: true,
          fieldName: true,
          rawValue: true,
          normalizedValue: true,
          unit: true,
          referenceRange: true,
          confidence: true,
          isLowConfidence: true,
          correctedValue: true,
          correctedAt: true,
        },
      },
    },
  });

  if (!record) {
    return NextResponse.json({ data: null, error: "NOT_FOUND" } satisfies ApiResponse<null>, { status: 404 });
  }

  const data = {
    id: record.id,
    patientId: record.patientId,
    recordType: record.recordType as RecordSummary["recordType"],
    recordDate: record.recordDate ? record.recordDate.toISOString().split("T")[0] : null,
    status: record.status as RecordSummary["status"],
    confidenceScore: record.confidenceScore,
    judgeVerified: record.judgeVerified,
    manuallyVerified: record.manuallyVerified,
    correctionNote: record.correctionNote,
    rawFileUrl: record.rawFileUrl,
    createdAt: record.createdAt.toISOString(),
    extractedFields: record.extractedFields.map(
      (f): ExtractedFieldDto & { correctedAt: string | null } => ({
        id: f.id,
        fieldName: f.fieldName,
        rawValue: f.rawValue,
        normalizedValue: f.normalizedValue,
        unit: f.unit,
        referenceRange: f.referenceRange,
        confidence: f.confidence,
        isLowConfidence: f.isLowConfidence,
        correctedValue: f.correctedValue,
        correctedAt: f.correctedAt ? f.correctedAt.toISOString() : null,
      })
    ),
  };

  return NextResponse.json({ data, error: null } satisfies ApiResponse<typeof data>);
}
