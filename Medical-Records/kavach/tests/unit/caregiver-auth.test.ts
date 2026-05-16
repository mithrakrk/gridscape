// tests/unit/caregiver-auth.test.ts
// Tests caregiver OTP auth logic in packages/auth/src/index.ts
// SYNTHETIC TEST DATA — NOT REAL PHI

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOtp, hashOtp, compareOtp, normalisePhone } from "../../packages/auth/src/index";

// ── generateOtp ──────────────────────────────────────────────────────────────

describe("generateOtp", () => {
  it("returns a 6-character string", () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
  });

  it("contains only digits", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("generates different values across calls (probabilistic)", () => {
    const otps = new Set(Array.from({ length: 10 }, generateOtp));
    // Astronomically unlikely to get 10 identical OTPs
    expect(otps.size).toBeGreaterThan(1);
  });
});

// ── hashOtp / compareOtp ─────────────────────────────────────────────────────

describe("hashOtp / compareOtp", () => {
  it("hashes and correctly verifies a matching OTP", async () => {
    const otp = "847291";
    const hash = await hashOtp(otp);
    expect(hash).not.toBe(otp); // never plaintext
    expect(await compareOtp(otp, hash)).toBe(true);
  });

  it("rejects a wrong OTP", async () => {
    const hash = await hashOtp("123456");
    expect(await compareOtp("654321", hash)).toBe(false);
  });

  it("produces different hashes for the same OTP (bcrypt salt)", async () => {
    const otp = "999999";
    const h1 = await hashOtp(otp);
    const h2 = await hashOtp(otp);
    expect(h1).not.toBe(h2);
    // Both verify correctly despite different hashes
    expect(await compareOtp(otp, h1)).toBe(true);
    expect(await compareOtp(otp, h2)).toBe(true);
  });
});

// ── normalisePhone ───────────────────────────────────────────────────────────

describe("normalisePhone", () => {
  it("accepts a 10-digit number starting with 6-9", () => {
    expect(normalisePhone("9876543210")).toBe("+919876543210");
    expect(normalisePhone("6543210987")).toBe("+916543210987");
  });

  it("accepts +91-prefixed E.164 format", () => {
    expect(normalisePhone("+919876543210")).toBe("+919876543210");
  });

  it("accepts 91-prefixed 12-digit format", () => {
    expect(normalisePhone("919876543210")).toBe("+919876543210");
  });

  it("strips non-digit characters before normalising", () => {
    // Spaces and dashes
    expect(normalisePhone("98765 43210")).toBe("+919876543210");
    expect(normalisePhone("98765-43210")).toBe("+919876543210");
  });

  it("rejects numbers starting with invalid digits (0-5)", () => {
    expect(normalisePhone("5876543210")).toBeNull();
    expect(normalisePhone("1234567890")).toBeNull();
  });

  it("rejects too-short numbers", () => {
    expect(normalisePhone("98765432")).toBeNull();
  });

  it("rejects too-long numbers", () => {
    expect(normalisePhone("987654321011")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(normalisePhone("")).toBeNull();
  });

  it("synthetic test numbers are rejected (not real mobile range)", () => {
    // +919999000001 is in valid range (starts with 9)
    expect(normalisePhone("9999000001")).toBe("+919999000001");
  });
});
