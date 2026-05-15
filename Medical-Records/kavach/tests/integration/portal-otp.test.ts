// tests/integration/portal-otp.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Integration tests for portal OTP flow.

import { describe, it, expect } from "vitest";
import { generateOtp, generatePortalToken } from "../../packages/auth/src/index";

// Synthetic token expiry check
function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}

describe("Portal OTP flow", () => {
  it("should generate valid access token", () => {
    const token = generatePortalToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(30);
  });

  it("unexpired token should pass expiry check", () => {
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
    expect(isTokenExpired(expiresAt)).toBe(false);
  });

  it("expired token should fail expiry check", () => {
    const expiresAt = new Date(Date.now() - 1000); // 1 second in the past
    expect(isTokenExpired(expiresAt)).toBe(true);
  });

  it("OTP should be 6 digits", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });
});
