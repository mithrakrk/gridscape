/**
 * PATCH /api/records/[id]/fields/[fieldId]
 * Manual correction of an extracted field value.
 *
 * Body: { correctedValue: string }
 *
 * - Verifies account owns the record (via patient)
 * - Sets correctedValue, correctedAt, correctedBy (accountId)
 * - Logs FIELD_CORRECTED audit event (before/after — field name only, not PHI values in log)
 * - After correction: re-evaluates whether all low-confidence fields are resolved;
 *   if so, marks record as manuallyVerified = true
 *
 * Returns 404 on cross-account access (anti-enumeration).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@kavach/db";
import type { ApiResponse, ExtractedFieldDto } from "@kavach/types";

type Params = { params: { id: string; fieldId: string } };

function accountId(req: NextRequest) {
  return req.headers.get("x-kavach-account-id");
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const acctId = accountId(req);
  if (!acctId) {
    return NextResponse.json({ data: null, error: "UNAUTHENTICATED" } satisfies ApiResponse<null>, { status: 401 });
  }

  // Verify the field belongs to a record owned by this account
  const field = await prisma.extractedField.findFirst({
    where: {
      id: params.fieldId,
      recordId: params.id,
      record: {
        deletedAt: null,
        patient: { accountId: acctId, deletedAt: null },
      },
    },
    select: {
      id: true,
      fieldName: true,
      rawValue: true,
      correctedValue: true,
      recordId: true,
    },
  });

  if (!field) {
    return NextResponse.json({ data: null, error: "NOT_FOUND" } satisfies ApiResponse<null>, { status: 404 });
  }

  // Parse body
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ data: null, error: "INVALID_JSON" } satisfies ApiResponse<null>, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (typeof b.correctedValue !== "string" || b.correctedValue.trim().length === 0) {
    return NextResponse.json({ data: null, error: "MISSING_CORRECTED_VALUE" } satisfies ApiResponse<null>, { status: 400 });
  }

  const correctedValue = b.correctedValue.trim();
  const now = new Date();

  // Update the field
  const updated = await prisma.extractedField.update({
    where: { id: field.id },
    data: { correctedValue, correctedAt: now, correctedBy: acctId },
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
  });

  // Log audit event — field name only, NOT the corrected value (may be PHI)
  await prisma.auditEvent.create({
    data: {
      accountId: acctId,
      recordId: field.recordId,
      eventType: "FIELD_CORRECTED",
      actor: acctId,
      metadata: {
        fieldId: field.id,
        fieldName: field.fieldName,
        hadPreviousCorrection: field.correctedValue !== null,
      },
    },
  });

  // Check if all low-confidence fields on this record now have corrections
  const unresolvedLowConfidence = await prisma.extractedField.count({
    where: {
      recordId: field.recordId,
      isLowConfidence: true,
      correctedValue: null,
    },
  });

  if (unresolvedLowConfidence === 0) {
    // All flagged fields resolved — promote record to manuallyVerified
    await prisma.record.update({
      where: { id: field.recordId },
      data: { manuallyVerified: true, status: "VERIFIED" },
    });

    await prisma.auditEvent.create({
      data: {
        accountId: acctId,
        recordId: field.recordId,
        eventType: "RECORD_MANUALLY_VERIFIED",
        actor: acctId,
        metadata: { trigger: "all_low_confidence_resolved" },
      },
    });
  }

  const dto: ExtractedFieldDto & { correctedAt: string | null } = {
    id: updated.id,
    fieldName: updated.fieldName,
    rawValue: updated.rawValue,
    normalizedValue: updated.normalizedValue,
    unit: updated.unit,
    referenceRange: updated.referenceRange,
    confidence: updated.confidence,
    isLowConfidence: updated.isLowConfidence,
    correctedValue: updated.correctedValue,
    correctedAt: updated.correctedAt ? updated.correctedAt.toISOString() : null,
  };

  return NextResponse.json({
    data: { field: dto, recordPromotedToVerified: unresolvedLowConfidence === 0 },
    error: null,
  } satisfies ApiResponse<{ field: typeof dto; recordPromotedToVerified: boolean }>);
}
