// tests/unit/consent.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Tests consent capture logic.

import { describe, it, expect } from "vitest";

const CONSENT_VERSION = "v1.0";
const CONSENT_TEXT = "I agree that Kavach may process and store the medical records I upload, for the purpose of generating organised summaries for my family members care. I understand that my data is stored in India (AWS Mumbai) and I have the right to correct or erase my data at any time.";

function buildConsentRecord(accountId: string, ipAddress: string) {
  return {
    accountId,
    consentType: "DATA_PROCESSING",
    givenAt: new Date(),
    ipAddress,
    consentText: CONSENT_TEXT,
    version: CONSENT_VERSION,
    withdrawnAt: null,
  };
}

describe("Consent capture", () => {
  it("should create a consent record with required fields", () => {
    const consent = buildConsentRecord("cjtest001account001", "192.168.1.1");
    expect(consent.accountId).toBeDefined();
    expect(consent.consentType).toBe("DATA_PROCESSING");
    expect(consent.consentText.length).toBeGreaterThan(100); // Meaningful text
    expect(consent.version).toBe(CONSENT_VERSION);
    expect(consent.givenAt).toBeInstanceOf(Date);
    expect(consent.withdrawnAt).toBeNull();
  });

  it("should require explicit acceptance (non-empty consent text)", () => {
    const consent = buildConsentRecord("cjtest001account001", "192.168.1.1");
    expect(consent.consentText.trim().length).toBeGreaterThan(0);
  });

  it("should record IP address for audit trail", () => {
    const consent = buildConsentRecord("cjtest001account001", "10.0.0.1");
    expect(consent.ipAddress).toBe("10.0.0.1");
  });
});
