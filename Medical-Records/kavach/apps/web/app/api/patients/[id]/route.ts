/**
 * GET    /api/patients/[id]   — get patient detail (scoped to account)
 * PATCH  /api/patients/[id]   — update name, dob, bloodGroup, weightKg, allergies
 * DELETE /api/patients/[id]   — soft-delete (sets deletedAt)
 *
 * All operations verify the patient belongs to the authenticated account.
 * Never expose patients from other accounts — return 404 on scope mismatch.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@kavach/db";
import type { ApiResponse, PatientSummary, RecordSummary } from "@kavach/types";

type Params = { params: { id: string } };

function accountIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-kavach-account-id");
}

// ── Shared: fetch patient scoped to account ───────────────────────────────────

async function getPatientForAccount(patientId: string, accountId: string) {
  return prisma.patientProfile.findFirst({
    where: { id: patientId, accountId, deletedAt: null },
  });
}

// ── GET /api/patients/[id] ────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const accountId = accountIdFromRequest(req);
  if (!accountId) {
    return NextResponse.json({ data: null, error: "UNAUTHENTICATED" } satisfies ApiResponse<null>, { status: 401 });
  }

  const patient = await prisma.patientProfile.findFirst({
    where: { id: params.id, accountId, deletedAt: null },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      weightKg: true,
      allergies: true,
      records: {
        where: { deletedAt: null },
        orderBy: { recordDate: "desc" },
        select: {
          id: true,
          recordType: true,
          recordDate: true,
          status: true,
          confidenceScore: true,
          judgeVerified: true,
          manuallyVerified: true,
        },
        take: 20,
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ data: null, error: "NOT_FOUND" } satisfies ApiResponse<null>, { status: 404 });
  }

  const dob = patient.dateOfBirth;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const data = {
    id: patient.id,
    name: patient.name,
    dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
    age,
    bloodGroup: patient.bloodGroup,
    weightKg: patient.weightKg,
    allergies: patient.allergies,
    records: patient.records.map(
      (r): RecordSummary => ({
        id: r.id,
        recordType: r.recordType as RecordSummary["recordType"],
        recordDate: r.recordDate ? r.recordDate.toISOString().split("T")[0] : null,
        status: r.status as RecordSummary["status"],
        confidenceScore: r.confidenceScore,
        judgeVerified: r.judgeVerified,
        manuallyVerified: r.manuallyVerified,
      })
    ),
  };

  return NextResponse.json({ data, error: null } satisfies ApiResponse<typeof data>);
}

// ── PATCH /api/patients/[id] ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const accountId = accountIdFromRequest(req);
  if (!accountId) {
    return NextResponse.json({ data: null, error: "UNAUTHENTICATED" } satisfies ApiResponse<null>, { status: 401 });
  }

  const existing = await getPatientForAccount(params.id, accountId);
  if (!existing) {
    return NextResponse.json({ data: null, error: "NOT_FOUND" } satisfies ApiResponse<null>, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ data: null, error: "INVALID_JSON" } satisfies ApiResponse<null>, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ data: null, error: "INVALID_BODY" } satisfies ApiResponse<null>, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const updates: {
    name?: string;
    dateOfBirth?: Date | null;
    bloodGroup?: string | null;
    weightKg?: number | null;
    allergies?: string[];
  } = {};

  if (typeof b.name === "string" && b.name.trim().length > 0) updates.name = b.name.trim();
  if (b.dateOfBirth === null) updates.dateOfBirth = null;
  else if (typeof b.dateOfBirth === "string") {
    const d = new Date(b.dateOfBirth);
    if (!isNaN(d.getTime())) updates.dateOfBirth = d;
  }
  if (b.bloodGroup === null || typeof b.bloodGroup === "string") updates.bloodGroup = b.bloodGroup as string | null;
  if (b.weightKg === null || typeof b.weightKg === "number") updates.weightKg = b.weightKg as number | null;
  if (Array.isArray(b.allergies)) {
    updates.allergies = (b.allergies as unknown[]).filter((a): a is string => typeof a === "string");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ data: null, error: "NO_FIELDS_TO_UPDATE" } satisfies ApiResponse<null>, { status: 400 });
  }

  const updated = await prisma.patientProfile.update({
    where: { id: params.id },
    data: updates,
    select: { id: true, name: true, dateOfBirth: true, bloodGroup: true, weightKg: true, allergies: true },
  });

  await prisma.auditEvent.create({
    data: {
      accountId,
      eventType: "PATIENT_UPDATED",
      actor: accountId,
      metadata: { patientId: params.id, updatedFields: Object.keys(updates) },
    },
  });

  const dob = updated.dateOfBirth;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const data: PatientSummary = {
    id: updated.id,
    name: updated.name,
    dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
    age,
    bloodGroup: updated.bloodGroup,
    weightKg: updated.weightKg,
    allergies: updated.allergies,
  };

  return NextResponse.json({ data, error: null } satisfies ApiResponse<PatientSummary>);
}

// ── DELETE /api/patients/[id] ─────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: Params) {
  const accountId = accountIdFromRequest(req);
  if (!accountId) {
    return NextResponse.json({ data: null, error: "UNAUTHENTICATED" } satisfies ApiResponse<null>, { status: 401 });
  }

  const existing = await getPatientForAccount(params.id, accountId);
  if (!existing) {
    return NextResponse.json({ data: null, error: "NOT_FOUND" } satisfies ApiResponse<null>, { status: 404 });
  }

  // Soft delete — tombstone only, physical erasure is a separate compliance flow
  await prisma.patientProfile.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  await prisma.auditEvent.create({
    data: {
      accountId,
      eventType: "PATIENT_DELETED",
      actor: accountId,
      metadata: { patientId: params.id },
    },
  });

  return NextResponse.json({ data: { id: params.id }, error: null } satisfies ApiResponse<{ id: string }>);
}
