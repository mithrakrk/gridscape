// tests/api/records.test.ts
// Record detail and field correction API contract tests — mocked Prisma.
// SYNTHETIC TEST DATA — NOT REAL PHI

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Synthetic fixtures ────────────────────────────────────────────────────────

const ACCT_A  = "cjtest001account001";
const PAT_1   = "cjtest001patient001";
const REC_1   = "cjtest001record001";
const FIELD_1 = "cjtest001field001"; // isLowConfidence = true
const FIELD_2 = "cjtest001field002"; // isLowConfidence = false

const mockRecord = {
  id: REC_1,
  patientId: PAT_1,
  recordType: "LAB_REPORT",
  recordDate: new Date("2025-06-01"),
  status: "LOW_CONFIDENCE",
  confidenceScore: 0.72,
  judgeVerified: true,
  manuallyVerified: false,
  correctionNote: null,
  rawFileUrl: "s3://kavach-dev/synthetic/rec001.pdf",
  createdAt: new Date("2026-01-01"),
  extractedFields: [
    {
      id: FIELD_1,
      fieldName: "Haemoglobin",
      rawValue: "11.2",
      normalizedValue: "11.2",
      unit: "g/dL",
      referenceRange: "12–17",
      confidence: 0.65,
      isLowConfidence: true,
      correctedValue: null,
      correctedAt: null,
    },
    {
      id: FIELD_2,
      fieldName: "Blood Glucose",
      rawValue: "95",
      normalizedValue: "95",
      unit: "mg/dL",
      referenceRange: "70–110",
      confidence: 0.95,
      isLowConfidence: false,
      correctedValue: null,
      correctedAt: null,
    },
  ],
};

const mockField = {
  id: FIELD_1,
  fieldName: "Haemoglobin",
  rawValue: "11.2",
  correctedValue: null,
  recordId: REC_1,
};

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  record: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  extractedField: {
    findFirst: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  auditEvent: { create: vi.fn() },
}));

vi.mock("@kavach/db", () => ({ prisma: mockPrisma }));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(opts: { accountId?: string; method?: string; body?: unknown }) {
  const headers = new Headers({ "content-type": "application/json" });
  if (opts.accountId) headers.set("x-kavach-account-id", opts.accountId);
  return new Request("http://localhost/api/records", {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

// Import after mock is registered
const { GET } = await import("../../apps/web/app/api/records/[id]/route");
const { PATCH } = await import("../../apps/web/app/api/records/[id]/fields/[fieldId]/route");

// ── GET /api/records/[id] ─────────────────────────────────────────────────────

describe("GET /api/records/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
  });

  it("returns 401 if no account header", async () => {
    const res = await GET(makeReq({}) as any, { params: { id: REC_1 } });
    expect(res.status).toBe(401);
  });

  it("returns 404 if record not found for account", async () => {
    mockPrisma.record.findFirst.mockResolvedValue(null);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any, { params: { id: "nonexistent" } });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("NOT_FOUND");
  });

  it("returns record with extracted fields", async () => {
    mockPrisma.record.findFirst.mockResolvedValue(mockRecord);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any, { params: { id: REC_1 } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(REC_1);
    expect(body.data.recordType).toBe("LAB_REPORT");
    expect(body.data.extractedFields).toHaveLength(2);
    expect(body.error).toBeNull();
  });

  it("serialises recordDate as ISO date string", async () => {
    mockPrisma.record.findFirst.mockResolvedValue(mockRecord);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any, { params: { id: REC_1 } });
    const body = await res.json();
    expect(body.data.recordDate).toBe("2025-06-01");
  });

  it("queries DB with account-scoping via patient relation", async () => {
    mockPrisma.record.findFirst.mockResolvedValue(null);
    await GET(makeReq({ accountId: ACCT_A }) as any, { params: { id: REC_1 } });
    expect(mockPrisma.record.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patient: expect.objectContaining({ accountId: ACCT_A }),
        }),
      })
    );
  });

  it("exposes isLowConfidence on extracted fields", async () => {
    mockPrisma.record.findFirst.mockResolvedValue(mockRecord);
    const res = await GET(makeReq({ accountId: ACCT_A }) as any, { params: { id: REC_1 } });
    const body = await res.json();
    const low = body.data.extractedFields.find((f: { id: string }) => f.id === FIELD_1);
    expect(low.isLowConfidence).toBe(true);
    expect(low.correctedValue).toBeNull();
  });
});

// ── PATCH /api/records/[id]/fields/[fieldId] ──────────────────────────────────

describe("PATCH /api/records/[id]/fields/[fieldId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.auditEvent.create.mockResolvedValue({});
    mockPrisma.extractedField.findFirst.mockResolvedValue(mockField);
    mockPrisma.extractedField.update.mockResolvedValue({
      ...mockField,
      correctedValue: "11.8",
      correctedAt: new Date(),
      normalizedValue: "11.2",
      unit: "g/dL",
      referenceRange: "12–17",
      confidence: 0.65,
      isLowConfidence: true,
    });
    mockPrisma.extractedField.count.mockResolvedValue(0); // No more unresolved low-confidence
    mockPrisma.record.update.mockResolvedValue({ id: REC_1 });
  });

  it("returns 401 if no account header", async () => {
    const res = await PATCH(makeReq({ method: "PATCH" }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    expect(res.status).toBe(401);
  });

  it("returns 404 if field not found or cross-account", async () => {
    mockPrisma.extractedField.findFirst.mockResolvedValue(null);
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "12.0" } }) as any, { params: { id: REC_1, fieldId: "nonexistent" } });
    expect(res.status).toBe(404);
  });

  it("returns 400 if correctedValue is missing", async () => {
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: {} }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("MISSING_CORRECTED_VALUE");
  });

  it("returns 400 if correctedValue is empty string", async () => {
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "  " } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    expect(res.status).toBe(400);
  });

  it("saves corrected value successfully", async () => {
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    expect(res.status).toBe(200);
    expect(mockPrisma.extractedField.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correctedValue: "11.8", correctedBy: ACCT_A }),
      })
    );
  });

  it("logs FIELD_CORRECTED audit event with field name (not value)", async () => {
    await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    const call = mockPrisma.auditEvent.create.mock.calls[0][0];
    expect(call.data.eventType).toBe("FIELD_CORRECTED");
    expect(call.data.metadata.fieldName).toBe("Haemoglobin");
    // Must NOT store the corrected value in the audit log (PHI)
    expect(JSON.stringify(call.data.metadata)).not.toContain("11.8");
  });

  it("promotes record to VERIFIED when all low-confidence fields resolved", async () => {
    mockPrisma.extractedField.count.mockResolvedValue(0); // All resolved
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    const body = await res.json();
    expect(body.data.recordPromotedToVerified).toBe(true);
    expect(mockPrisma.record.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { manuallyVerified: true, status: "VERIFIED" } })
    );
  });

  it("does NOT promote record when unresolved low-confidence fields remain", async () => {
    mockPrisma.extractedField.count.mockResolvedValue(2); // Still unresolved
    const res = await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    const body = await res.json();
    expect(body.data.recordPromotedToVerified).toBe(false);
    expect(mockPrisma.record.update).not.toHaveBeenCalled();
  });

  it("logs RECORD_MANUALLY_VERIFIED when promoted", async () => {
    mockPrisma.extractedField.count.mockResolvedValue(0);
    await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    const auditCalls = mockPrisma.auditEvent.create.mock.calls.map((c: any) => c[0].data.eventType);
    expect(auditCalls).toContain("RECORD_MANUALLY_VERIFIED");
  });

  it("queries field with account-scoping via record→patient relation", async () => {
    await PATCH(makeReq({ accountId: ACCT_A, method: "PATCH", body: { correctedValue: "11.8" } }) as any, { params: { id: REC_1, fieldId: FIELD_1 } });
    expect(mockPrisma.extractedField.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: FIELD_1,
          recordId: REC_1,
          record: expect.objectContaining({
            patient: expect.objectContaining({ accountId: ACCT_A }),
          }),
        }),
      })
    );
  });
});
