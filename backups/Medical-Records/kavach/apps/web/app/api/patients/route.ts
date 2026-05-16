/**
 * GET /api/patients  — list all active patients for the authenticated account
 * POST /api/patients — create a new patient profile
 *
 * accountId is read from x-kavach-account-id header injected by middleware.
 * All queries are scoped to accountId — never return cross-account data.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@kavach/db";
import type { ApiResponse, PatientSummary } from "@kavach/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function accountIdFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-kavach-account-id");
}

function toPatientSummary(p: {
  id: string;
  name: string;
  dateOfBirth: Date | null;
  bloodGroup: string | null;
  weightKg: number | null;
  allergies: string[];
  _count?: { records: number };
}): PatientSummary & { recordCount: number } {
  const dob = p.dateOfBirth;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  return {
    id: p.id,
    name: p.name,
    dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
    age,
    bloodGroup: p.bloodGroup,
    weightKg: p.weightKg,
    allergies: p.allergies,
    recordCount: p._count?.records ?? 0,
  };
}

// ── GET /api/patients ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const accountId = accountIdFromRequest(req);
  if (!accountId) {
    const res: ApiResponse<null> = { data: null, error: "UNAUTHENTICATED" };
    return NextResponse.json(res, { status: 401 });
  }

  const patients = await prisma.patientProfile.findMany({
    where: { accountId, deletedAt: null, isArchived: false },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      weightKg: true,
      allergies: true,
      _count: { select: { records: { where: { deletedAt: null } } } },
    },
  });

  const res: ApiResponse<ReturnType<typeof toPatientSummary>[]> = {
    data: patients.map(toPatientSummary),
    error: null,
  };
  return NextResponse.json(res);
}

// ── POST /api/patients ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const accountId = accountIdFromRequest(req);
  if (!accountId) {
    const res: ApiResponse<null> = { data: null, error: "UNAUTHENTICATED" };
    return NextResponse.json(res, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "INVALID_JSON" } satisfies ApiResponse<null>,
      { status: 400 }
    );
  }

  const parsed = parseCreateBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { data: null, error: parsed.error } satisfies ApiResponse<null>,
      { status: 400 }
    );
  }

  const patient = await prisma.patientProfile.create({
    data: {
      accountId,
      name: parsed.name,
      dateOfBirth: parsed.dateOfBirth,
      bloodGroup: parsed.bloodGroup ?? null,
      weightKg: parsed.weightKg ?? null,
      allergies: parsed.allergies ?? [],
    },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      bloodGroup: true,
      weightKg: true,
      allergies: true,
    },
  });

  // Audit
  await prisma.auditEvent.create({
    data: {
      accountId,
      eventType: "PATIENT_CREATED",
      actor: accountId,
      metadata: { patientId: patient.id },
    },
  });

  const res: ApiResponse<ReturnType<typeof toPatientSummary>> = {
    data: toPatientSummary({ ...patient, _count: { records: 0 } }),
    error: null,
  };
  return NextResponse.json(res, { status: 201 });
}

// ── Body parsing ──────────────────────────────────────────────────────────────

type ParsedCreate =
  | { ok: true; name: string; dateOfBirth: Date | null; bloodGroup?: string; weightKg?: number; allergies?: string[] }
  | { ok: false; error: string };

function parseCreateBody(body: unknown): ParsedCreate {
  if (!body || typeof body !== "object") return { ok: false, error: "INVALID_BODY" };
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || b.name.trim().length === 0) {
    return { ok: false, error: "MISSING_NAME" };
  }

  let dateOfBirth: Date | null = null;
  if (b.dateOfBirth && typeof b.dateOfBirth === "string") {
    const d = new Date(b.dateOfBirth);
    if (isNaN(d.getTime())) return { ok: false, error: "INVALID_DOB" };
    dateOfBirth = d;
  }

  return {
    ok: true,
    name: b.name.trim(),
    dateOfBirth,
    bloodGroup: typeof b.bloodGroup === "string" ? b.bloodGroup.trim() : undefined,
    weightKg: typeof b.weightKg === "number" ? b.weightKg : undefined,
    allergies: Array.isArray(b.allergies)
      ? (b.allergies as unknown[]).filter((a): a is string => typeof a === "string")
      : [],
  };
}
