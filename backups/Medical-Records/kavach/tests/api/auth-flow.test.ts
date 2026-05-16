// tests/api/auth-flow.test.ts
// Integration-style tests for the caregiver OTP auth flow.
// Mocks the Prisma client — no live DB required.
// SYNTHETIC TEST DATA — NOT REAL PHI

import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestCaregiverOtp, verifyCaregiverOtp, hashOtp } from "../../packages/auth/src/index";

// ── Mock the Prisma client ────────────────────────────────────────────────────

const SYNTHETIC_ACCOUNT_ID = "cjtest001account001";
const SYNTHETIC_PHONE = "+919999000001"; // Synthetic — not a real number

const mockPrisma = vi.hoisted(() => ({
  account: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
  caregiverOtp: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@kavach/db", () => ({
  prisma: mockPrisma,
}));

// ── requestCaregiverOtp ───────────────────────────────────────────────────────

describe("requestCaregiverOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";

    mockPrisma.account.upsert.mockResolvedValue({
      id: SYNTHETIC_ACCOUNT_ID,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"), // same = new account
    });
    mockPrisma.caregiverOtp.upsert.mockResolvedValue({});
  });

  it("returns ok:true for a valid Indian phone number", async () => {
    const result = await requestCaregiverOtp("9999000001");
    expect(result.ok).toBe(true);
  });

  it("returns an accountId on success", async () => {
    const result = await requestCaregiverOtp("9999000001");
    if (!result.ok) throw new Error("Expected ok");
    expect(result.accountId).toBe(SYNTHETIC_ACCOUNT_ID);
  });

  it("returns _devOtp in test environment", async () => {
    const result = await requestCaregiverOtp("9999000001");
    if (!result.ok) throw new Error("Expected ok");
    expect(result._devOtp).toBeDefined();
    expect(result._devOtp).toMatch(/^\d{6}$/);
  });

  it("calls account.upsert with normalised phone number", async () => {
    await requestCaregiverOtp("9999000001");
    expect(mockPrisma.account.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { phoneNumber: SYNTHETIC_PHONE },
      })
    );
  });

  it("calls caregiverOtp.upsert to store OTP hash", async () => {
    await requestCaregiverOtp("9999000001");
    expect(mockPrisma.caregiverOtp.upsert).toHaveBeenCalledOnce();
    const call = mockPrisma.caregiverOtp.upsert.mock.calls[0][0];
    // OTP hash must not equal the raw OTP (must be bcrypt'd)
    const raw = expect.stringMatching(/^\d{6}$/);
    expect(call.create.otpHash).not.toMatch(raw);
  });

  it("returns ok:false for invalid phone", async () => {
    const result = await requestCaregiverOtp("12345");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("INVALID_PHONE");
  });

  it("does not return _devOtp when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    const result = await requestCaregiverOtp("9999000001");
    if (!result.ok) throw new Error("Expected ok");
    expect((result as { _devOtp?: string })._devOtp).toBeUndefined();
    process.env.NODE_ENV = "test";
  });
});

// ── verifyCaregiverOtp ────────────────────────────────────────────────────────

describe("verifyCaregiverOtp", () => {
  const SYNTHETIC_OTP = "847291";
  let storedHash: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    storedHash = await hashOtp(SYNTHETIC_OTP);

    mockPrisma.account.findUnique.mockResolvedValue({ id: SYNTHETIC_ACCOUNT_ID });
    mockPrisma.caregiverOtp.findUnique.mockResolvedValue({
      accountId: SYNTHETIC_ACCOUNT_ID,
      otpHash: storedHash,
      expiresAt: new Date(Date.now() + 10 * 60_000), // 10 min from now
      attempts: 0,
      verifiedAt: null,
    });
    mockPrisma.caregiverOtp.update.mockResolvedValue({});
  });

  it("returns ok:true for a correct OTP", async () => {
    const result = await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    expect(result.ok).toBe(true);
  });

  it("returns the accountId on success", async () => {
    const result = await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    if (!result.ok) throw new Error("Expected ok");
    expect(result.accountId).toBe(SYNTHETIC_ACCOUNT_ID);
  });

  it("clears the OTP hash after successful verification", async () => {
    await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    expect(mockPrisma.caregiverOtp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verifiedAt: expect.any(Date), otpHash: "" }),
      })
    );
  });

  it("returns INVALID_OTP for wrong OTP", async () => {
    const result = await verifyCaregiverOtp("9999000001", "000000");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("INVALID_OTP");
  });

  it("increments attempts on wrong OTP", async () => {
    await verifyCaregiverOtp("9999000001", "000000");
    expect(mockPrisma.caregiverOtp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } })
    );
  });

  it("returns LOCKED when attempts >= 3", async () => {
    mockPrisma.caregiverOtp.findUnique.mockResolvedValue({
      accountId: SYNTHETIC_ACCOUNT_ID,
      otpHash: storedHash,
      expiresAt: new Date(Date.now() + 10 * 60_000),
      attempts: 3,
      verifiedAt: null,
    });
    const result = await verifyCaregiverOtp("9999000001", "000000");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("LOCKED");
  });

  it("returns EXPIRED for an expired OTP", async () => {
    mockPrisma.caregiverOtp.findUnique.mockResolvedValue({
      accountId: SYNTHETIC_ACCOUNT_ID,
      otpHash: storedHash,
      expiresAt: new Date(Date.now() - 1000), // 1s in the past
      attempts: 0,
      verifiedAt: null,
    });
    const result = await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("EXPIRED");
  });

  it("returns NO_OTP when account does not exist", async () => {
    mockPrisma.account.findUnique.mockResolvedValue(null);
    const result = await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("NO_OTP");
  });

  it("returns NO_OTP when OTP already verified", async () => {
    mockPrisma.caregiverOtp.findUnique.mockResolvedValue({
      accountId: SYNTHETIC_ACCOUNT_ID,
      otpHash: storedHash,
      expiresAt: new Date(Date.now() + 10 * 60_000),
      attempts: 0,
      verifiedAt: new Date(), // already verified
    });
    const result = await verifyCaregiverOtp("9999000001", SYNTHETIC_OTP);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("NO_OTP");
  });
});

// ── Session type expectations ─────────────────────────────────────────────────

describe("Session type", () => {
  it("KavachSession fields are typed correctly", async () => {
    const { isAuthenticated } = await import("../../apps/web/lib/session");
    // isAuthenticated requires accountId to be a non-empty string
    expect(isAuthenticated({ accountId: "cjtest001account001", phoneNumber: "+919999000001" })).toBe(true);
    expect(isAuthenticated({})).toBe(false);
    expect(isAuthenticated({ accountId: "" })).toBe(false);
  });
});
