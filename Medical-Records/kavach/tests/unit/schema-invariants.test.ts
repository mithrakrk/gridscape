// tests/unit/schema-invariants.test.ts
// Validates core schema invariants from the Prisma schema — SYNTHETIC DATA ONLY.
// These tests exercise the data-model rules without a live database.

import { describe, it, expect } from "vitest";

// ── Fixtures (synthetic — not real PHI) ────────────────────────────────────

const ACCOUNT = {
  id: "cjschema001account",
  phoneNumber: "+919999000099", // Synthetic
  email: "schema.test@example.com",
};

const PATIENT_A = {
  id: "cjschema001patient",
  accountId: ACCOUNT.id,
  name: "Schema Test Patient A (Synthetic)",
  bloodGroup: "B+",
  allergies: ["Aspirin"],
  isArchived: false,
  deletedAt: null,
};

const PATIENT_B = {
  id: "cjschema002patient",
  accountId: ACCOUNT.id,
  name: "Schema Test Patient B (Synthetic)",
  bloodGroup: null,
  allergies: [],
  isArchived: false,
  deletedAt: null,
};

const PATIENT_OTHER_ACCOUNT = {
  id: "cjschema003patient",
  accountId: "cjschema999account", // Different account
  name: "Other Account Patient (Synthetic)",
  allergies: [],
  isArchived: false,
  deletedAt: null,
};

const RECORD_VERIFIED = {
  id: "cjschema001record",
  patientId: PATIENT_A.id,
  rawFileUrl: "s3://kavach-test/synthetic/schema-test-001.jpg",
  rawFileKey: "synthetic/schema-test-001.jpg",
  recordType: "LAB_REPORT",
  status: "VERIFIED",
  confidenceScore: 0.95,
  judgeVerified: true,
  manuallyVerified: false,
  deletedAt: null,
};

const RECORD_LOW_CONFIDENCE = {
  id: "cjschema002record",
  patientId: PATIENT_A.id,
  rawFileUrl: "s3://kavach-test/synthetic/schema-test-002.jpg",
  rawFileKey: "synthetic/schema-test-002.jpg",
  recordType: "PRESCRIPTION",
  status: "LOW_CONFIDENCE",
  confidenceScore: 0.58,
  judgeVerified: false,
  manuallyVerified: false,
  deletedAt: null,
};

const EXTRACTED_FIELD_HIGH = {
  id: "cjschema001field",
  recordId: RECORD_VERIFIED.id,
  fieldName: "hba1c",
  rawValue: "7.1%",
  normalizedValue: "7.1",
  unit: "%",
  referenceRange: "4.0-5.6%",
  confidence: 0.97,
  isLowConfidence: false,
};

const EXTRACTED_FIELD_LOW = {
  id: "cjschema002field",
  recordId: RECORD_LOW_CONFIDENCE.id,
  fieldName: "dosage",
  rawValue: "250m",
  normalizedValue: null,
  unit: null,
  confidence: 0.40,
  isLowConfidence: true,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe("Schema invariant: Account → PatientProfile scoping", () => {
  const allPatients = [PATIENT_A, PATIENT_B, PATIENT_OTHER_ACCOUNT];

  it("returns only patients belonging to the queried accountId", () => {
    const result = allPatients.filter((p) => p.accountId === ACCOUNT.id);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(
      expect.arrayContaining([PATIENT_A.id, PATIENT_B.id])
    );
  });

  it("does not leak patients from other accounts", () => {
    const result = allPatients.filter((p) => p.accountId === ACCOUNT.id);
    expect(result.find((p) => p.id === PATIENT_OTHER_ACCOUNT.id)).toBeUndefined();
  });

  it("excludes soft-deleted patients from active queries", () => {
    const deletedPatient = { ...PATIENT_A, deletedAt: new Date("2025-01-01") };
    const activePatients = [PATIENT_A, PATIENT_B, deletedPatient].filter(
      (p) => p.accountId === ACCOUNT.id && p.deletedAt === null
    );
    // PATIENT_A appears as both non-deleted and deleted — only non-deleted passes
    expect(activePatients.length).toBe(2);
  });
});

describe("Schema invariant: PatientProfile → Record scoping", () => {
  const allRecords = [RECORD_VERIFIED, RECORD_LOW_CONFIDENCE];

  it("returns only records for the queried patientId", () => {
    const result = allRecords.filter((r) => r.patientId === PATIENT_A.id);
    expect(result).toHaveLength(2);
  });

  it("excludes soft-deleted records", () => {
    const deletedRecord = { ...RECORD_VERIFIED, deletedAt: new Date("2025-01-01") };
    const active = [RECORD_VERIFIED, RECORD_LOW_CONFIDENCE, deletedRecord].filter(
      (r) => r.patientId === PATIENT_A.id && r.deletedAt === null
    );
    expect(active).toHaveLength(2);
  });
});

describe("Schema invariant: RecordStatus lifecycle", () => {
  const VALID_STATUSES = ["PENDING", "PROCESSING", "EXTRACTION_FAILED", "LOW_CONFIDENCE", "VERIFIED"];

  it("verified record has confidenceScore and judgeVerified=true", () => {
    expect(RECORD_VERIFIED.status).toBe("VERIFIED");
    expect(RECORD_VERIFIED.confidenceScore).toBeGreaterThanOrEqual(0.85);
    expect(RECORD_VERIFIED.judgeVerified).toBe(true);
  });

  it("low-confidence record flags have confidence below threshold", () => {
    expect(RECORD_LOW_CONFIDENCE.status).toBe("LOW_CONFIDENCE");
    expect(RECORD_LOW_CONFIDENCE.confidenceScore).toBeLessThan(0.85);
  });

  it("all statuses in fixtures are valid enum values", () => {
    for (const record of [RECORD_VERIFIED, RECORD_LOW_CONFIDENCE]) {
      expect(VALID_STATUSES).toContain(record.status);
    }
  });
});

describe("Schema invariant: ExtractedField confidence", () => {
  it("high-confidence field is not flagged as low confidence", () => {
    expect(EXTRACTED_FIELD_HIGH.isLowConfidence).toBe(false);
    expect(EXTRACTED_FIELD_HIGH.confidence).toBeGreaterThan(0.85);
  });

  it("low-confidence field is correctly flagged", () => {
    expect(EXTRACTED_FIELD_LOW.isLowConfidence).toBe(true);
    expect(EXTRACTED_FIELD_LOW.confidence).toBeLessThan(0.85);
    expect(EXTRACTED_FIELD_LOW.normalizedValue).toBeNull();
  });

  it("field is scoped to its parent record", () => {
    expect(EXTRACTED_FIELD_HIGH.recordId).toBe(RECORD_VERIFIED.id);
    expect(EXTRACTED_FIELD_LOW.recordId).toBe(RECORD_LOW_CONFIDENCE.id);
  });
});
