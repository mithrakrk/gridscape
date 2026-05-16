// tests/api/patients.test.ts
// Patient CRUD API contract tests — mocked Prisma, no live DB required.
// SYNTHETIC TEST DATA — NOT REAL PHI

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Synthetic fixtures ────────────────────────────────────────────────────────

const ACCT_A = "cjtest001account001";
const ACCT_B = "cjtest002account002";
const PAT_1  = "cjtest001patient001";
const PAT_2  = "cjtest002patient002"; // belongs to ACCT_B

const mockPatient = {
  id: PAT_1,
  name: "Arjun Mehta",
  dateOfBirth: new Date("1960-03-15"),
  bloodGroup: "B+",
  weightKg: 72.5,
  allergies: ["Penicillin"],
  _count: { records: 3 },
};

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  patientProfile: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  auditEvent: { create: vi.fn() },
}));

vi.mock("@kavach/db", () => ({ prisma: mockPrisma }));

// ── Helper: build a mock NextRequest ─────────────────────────────────────────

function makeReq(opts: {
  method?: string;
  accountId?: string;
  body?: unknown;
  params?: Record<string, string>;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (opts.accountId) headers.set("x-kavach-account-id", opts.accountId);
  const url = "http://localhost/api/patients";
  return new Request(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

// Import handlers after mock is set up
const { GET, POST } = await import("../../apps/web/app/api/patients/route");
const { GET: GET_ID, PATCH, DELETE: DELETE_ID } = await import("../../apps/web/app/api/patients/[id]/route");

// ── GET /api/patients ─────────────────────────────────────────────────────────

describe("GET /api/patients", () => {
  beforeEach(() => { vi.clearAllMocks(); mockPrisma.auditEvent.create.mockResolvedValue({}); });

  it("returns 401 if no account header", async () => {
    const res = await GET(makeReq({}) as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("UNAUTHENTICATED");
  });

  it("returns empty array when account has no patients", async () => {
    mockPrisma.patientProfile.findMany.mockResolvedValue([]);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.error).toBeNull();
  });

  it("returns patients scoped to the authenticated account", async () => {
    mockPrisma.patientProfile.findMany.mockResolvedValue([mockPatient]);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe(PAT_1);
    expect(body.data[0].name).toBe("Arjun Mehta");
    expect(body.data[0].recordCount).toBe(3);
  });

  it("queries DB with correct accountId and deletedAt filter", async () => {
    mockPrisma.patientProfile.findMany.mockResolvedValue([]);
    await GET(makeReq({ accountId: ACCT_A }) as any);
    expect(mockPrisma.patientProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: ACCT_A, deletedAt: null }),
      })
    );
  });

  it("calculates age correctly from dateOfBirth", async () => {
    mockPrisma.patientProfile.findMany.mockResolvedValue([mockPatient]);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any);
    const body = await res.json();
    const patient = body.data[0];
    expect(patient.age).toBeGreaterThan(50); // born 1960
    expect(typeof patient.age).toBe("number");
  });
});

// ── POST /api/patients ────────────────────────────────────────────────────────

describe("POST /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
    mockPrisma.patientProfile.create.mockResolvedValue({
      id: PAT_1, name: "Arjun Mehta", dateOfBirth: new Date("1960-03-15"),
      bloodGroup: "B+", weightKg: 72.5, allergies: ["Penicillin"],
    });
  });

  it("returns 401 if no account header", async () => {
    const res = await POST(makeReq({ method: "POST", body: { name: "Test" } }) as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 if name is missing", async () => {
    const res = await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { dateOfBirth: "1990-01-01" } }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("MISSING_NAME");
  });

  it("returns 400 if name is empty string", async () => {
    const res = await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { name: "  " } }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("MISSING_NAME");
  });

  it("creates a patient with minimal required fields (name only)", async () => {
    const res = await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { name: "Arjun Mehta" } }) as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe(PAT_1);
    expect(body.data.name).toBe("Arjun Mehta");
    expect(body.error).toBeNull();
  });

  it("creates a patient scoped to authenticated accountId", async () => {
    await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { name: "Arjun Mehta" } }) as any);
    expect(mockPrisma.patientProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ accountId: ACCT_A }) })
    );
  });

  it("logs PATIENT_CREATED audit event", async () => {
    await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { name: "Arjun Mehta" } }) as any);
    expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: "PATIENT_CREATED", accountId: ACCT_A }) })
    );
  });

  it("returns 400 for invalid date of birth format", async () => {
    const res = await POST(makeReq({ method: "POST", accountId: ACCT_A, body: { name: "Test", dateOfBirth: "not-a-date" } }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("INVALID_DOB");
  });
});

// ── GET /api/patients/[id] ────────────────────────────────────────────────────

describe("GET /api/patients/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
  });

  it("returns 401 if no account header", async () => {
    const res = await GET_ID(makeReq({}) as any, { params: { id: PAT_1 } });
    expect(res.status).toBe(401);
  });

  it("returns 404 if patient not found for account", async () => {
    mockPrisma.patientProfile.findFirst.mockResolvedValue(null);
    const res = await GET_ID(makeReq({ accountId: ACCT_A }) as any, { params: { id: PAT_2 } });
    expect(res.status).toBe(404); // Cross-account → 404, not 403 (anti-enumeration)
  });

  it("returns patient detail with records", async () => {
    mockPrisma.patientProfile.findFirst.mockResolvedValue({
      ...mockPatient,
      records: [{
        id: "rec001", recordType: "LAB_REPORT", recordDate: new Date("2025-01-15"),
        status: "VERIFIED", confidenceScore: 0.97, judgeVerified: true, manuallyVerified: false,
      }],
    });
    const res = await GET_ID(makeReq({ accountId: ACCT_A }) as any, { params: { id: PAT_1 } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Arjun Mehta");
    expect(body.data.records).toHaveLength(1);
    expect(body.data.records[0].recordType).toBe("LAB_REPORT");
  });
});

// ── PATCH /api/patients/[id] ──────────────────────────────────────────────────

describe("PATCH /api/patients/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
    mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: PAT_1, accountId: ACCT_A, deletedAt: null });
    mockPrisma.patientProfile.update.mockResolvedValue({
      id: PAT_1, name: "Arjun Mehta Jr", dateOfBirth: new Date("1960-03-15"),
      bloodGroup: "A+", weightKg: 75, allergies: [],
    });
  });

  it("returns 401 if no account header", async () => {
    const res = await PATCH(makeReq({ method: "PATCH" }) as any, { params: { id: PAT_1 } });
    expect(res.status).toBe(401);
  });

  it("returns 404 if patient not in account", async () => {
    mockPrisma.patientProfile.findFirst.mockResolvedValue(null);
    const res = await PATCH(makeReq({ method: "PATCH", accountId: ACCT_A, body: { name: "X" } }) as any, { params: { id: PAT_2 } });
    expect(res.status).toBe(404);
  });

  it("updates name successfully", async () => {
    const res = await PATCH(makeReq({ method: "PATCH", accountId: ACCT_A, body: { name: "Arjun Mehta Jr" } }) as any, { params: { id: PAT_1 } });
    expect(res.status).toBe(200);
    expect(mockPrisma.patientProfile.update).toHaveBeenCalled();
  });

  it("logs PATIENT_UPDATED audit event", async () => {
    await PATCH(makeReq({ method: "PATCH", accountId: ACCT_A, body: { name: "New Name" } }) as any, { params: { id: PAT_1 } });
    expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: "PATIENT_UPDATED" }) })
    );
  });
});

// ── DELETE /api/patients/[id] ─────────────────────────────────────────────────

describe("DELETE /api/patients/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
    mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: PAT_1, accountId: ACCT_A, deletedAt: null });
    mockPrisma.patientProfile.update.mockResolvedValue({ id: PAT_1 });
  });

  it("returns 401 if no account header", async () => {
    const res = await DELETE_ID(makeReq({ method: "DELETE" }) as any, { params: { id: PAT_1 } });
    expect(res.status).toBe(401);
  });

  it("returns 404 if patient not in account", async () => {
    mockPrisma.patientProfile.findFirst.mockResolvedValue(null);
    const res = await DELETE_ID(makeReq({ method: "DELETE", accountId: ACCT_A }) as any, { params: { id: PAT_2 } });
    expect(res.status).toBe(404);
  });

  it("soft-deletes by setting deletedAt (not hard delete)", async () => {
    await DELETE_ID(makeReq({ method: "DELETE", accountId: ACCT_A }) as any, { params: { id: PAT_1 } });
    expect(mockPrisma.patientProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
    // MUST NOT call delete()
    expect((mockPrisma.patientProfile as any).delete).toBeUndefined();
  });

  it("logs PATIENT_DELETED audit event", async () => {
    await DELETE_ID(makeReq({ method: "DELETE", accountId: ACCT_A }) as any, { params: { id: PAT_1 } });
    expect(mockPrisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: "PATIENT_DELETED" }) })
    );
  });

  it("returns the deleted patient id", async () => {
    const res = await DELETE_ID(makeReq({ method: "DELETE", accountId: ACCT_A }) as any, { params: { id: PAT_1 } });
    const body = await res.json();
    expect(body.data.id).toBe(PAT_1);
  });
});
