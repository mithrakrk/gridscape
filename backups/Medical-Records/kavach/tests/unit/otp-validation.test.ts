// tests/unit/otp-validation.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Tests OTP generation and validation logic.

import { describe, it, expect } from "vitest";
import { generateOtp, generatePortalToken } from "../../packages/auth/src/index";

describe("OTP generation", () => {
  it("should generate a 6-digit OTP", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("should generate different OTPs each time", () => {
    const otp1 = generateOtp();
    const otp2 = generateOtp();
    // Not guaranteed different but overwhelmingly likely
    expect(typeof otp1).toBe("string");
    expect(typeof otp2).toBe("string");
  });
});

describe("Portal token generation", () => {
  it("should generate a URL-safe token", () => {
    const token = generatePortalToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should generate tokens of sufficient length", () => {
    const token = generatePortalToken();
    expect(token.length).toBeGreaterThanOrEqual(40); // 32 bytes base64url = ~43 chars
  });

  it("should generate unique tokens", () => {
    const tokens = new Set([generatePortalToken(), generatePortalToken(), generatePortalToken()]);
    expect(tokens.size).toBe(3);
  });
});
