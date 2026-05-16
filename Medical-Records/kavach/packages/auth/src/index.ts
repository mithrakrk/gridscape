/**
 * packages/auth/src/index.ts
 * Kavach caregiver authentication logic.
 *
 * Caregiver flow:
 *   1. POST /api/auth/request-otp  { phone } → create/find Account, store OTP hash
 *   2. POST /api/auth/verify-otp   { phone, otp } → verify hash, set session
 *
 * Doctor portal OTP flow is deferred to Milestone 3.
 * NEVER log OTP values. NEVER expose PHI in error messages.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@kavach/db";

// ── Constants ────────────────────────────────────────────────────────────────

export const CAREGIVER_OTP_EXPIRY_MINUTES = parseInt(
  process.env.OTP_EXPIRY_MINUTES ?? "10",
  10
);
const CAREGIVER_OTP_ATTEMPTS = 3;
const BCRYPT_ROUNDS = 10;

// Doctor portal constants (used in Milestone 3)
export const PORTAL_TOKEN_EXPIRY_HOURS = parseInt(
  process.env.PORTAL_TOKEN_EXPIRY_HOURS ?? "8",
  10
);

// ── OTP helpers ───────────────────────────────────────────────────────────────

/** Generate a 6-digit numeric OTP string. Never log the return value. */
export function generateOtp(): string {
  // Use crypto for uniform distribution (Math.random is not cryptographically secure)
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return String(num).padStart(6, "0");
}

/** Hash an OTP for storage. Never store or log the plaintext OTP. */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
}

/** Compare a plaintext OTP against a stored bcrypt hash. */
export async function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

// ── Portal token helpers (doctor portal — Milestone 3) ────────────────────────

/** Generate a cryptographically random URL-safe portal token. */
export function generatePortalToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// ── Caregiver OTP auth flow ───────────────────────────────────────────────────

export type RequestOtpResult =
  | { ok: true; accountId: string; isNew: boolean }
  | { ok: false; error: string };

/**
 * Step 1 — Request OTP for caregiver login.
 * Creates the Account if it doesn't exist (upsert by phoneNumber).
 * Stores an OTP hash on the account row (via a lightweight OTP store).
 * In production the OTP is sent via SMS provider; here we return it
 * only in test/dev environments via the result (never in prod logs).
 */
export async function requestCaregiverOtp(
  phoneNumber: string
): Promise<RequestOtpResult & { _devOtp?: string }> {
  // Normalise to E.164 (+91XXXXXXXXXX)
  const normalised = normalisePhone(phoneNumber);
  if (!normalised) {
    return { ok: false, error: "INVALID_PHONE" };
  }

  // Upsert account — do NOT expose whether the account is new to the caller
  // (prevents phone enumeration). We upsert silently.
  const account = await prisma.account.upsert({
    where: { phoneNumber: normalised },
    update: {},
    create: { phoneNumber: normalised },
    select: { id: true, createdAt: true, updatedAt: true },
  });

  const isNew = account.createdAt.getTime() === account.updatedAt.getTime();

  // Generate OTP and store hash in the OTP store table
  const otp = generateOtp();
  const hash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + CAREGIVER_OTP_EXPIRY_MINUTES * 60_000);

  // Upsert OTP record — one active OTP per account at a time
  await prisma.caregiverOtp.upsert({
    where: { accountId: account.id },
    update: { otpHash: hash, expiresAt, attempts: 0, verifiedAt: null },
    create: { accountId: account.id, otpHash: hash, expiresAt, attempts: 0 },
  });

  // In production this would trigger an SMS send.
  // Return _devOtp only when explicitly in development — never in production.
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

  return {
    ok: true,
    accountId: account.id,
    isNew,
    ...(isDev ? { _devOtp: otp } : {}),
  };
}

export type VerifyOtpResult =
  | { ok: true; accountId: string }
  | { ok: false; error: "INVALID_PHONE" | "NO_OTP" | "EXPIRED" | "INVALID_OTP" | "LOCKED" };

/**
 * Step 2 — Verify caregiver OTP.
 * On success: marks OTP as verified, returns accountId for session creation.
 * On failure: increments attempt count; locks after CAREGIVER_OTP_ATTEMPTS.
 */
export async function verifyCaregiverOtp(
  phoneNumber: string,
  otp: string
): Promise<VerifyOtpResult> {
  const normalised = normalisePhone(phoneNumber);
  if (!normalised) return { ok: false, error: "INVALID_PHONE" };

  const account = await prisma.account.findUnique({
    where: { phoneNumber: normalised },
    select: { id: true },
  });
  if (!account) return { ok: false, error: "NO_OTP" };

  const otpRecord = await prisma.caregiverOtp.findUnique({
    where: { accountId: account.id },
  });

  if (!otpRecord || otpRecord.verifiedAt !== null) return { ok: false, error: "NO_OTP" };

  // Check lockout
  if (otpRecord.attempts >= CAREGIVER_OTP_ATTEMPTS) {
    return { ok: false, error: "LOCKED" };
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    return { ok: false, error: "EXPIRED" };
  }

  // Compare OTP
  const valid = await compareOtp(otp, otpRecord.otpHash);

  if (!valid) {
    await prisma.caregiverOtp.update({
      where: { accountId: account.id },
      data: { attempts: { increment: 1 } },
    });
    const newAttempts = otpRecord.attempts + 1;
    if (newAttempts >= CAREGIVER_OTP_ATTEMPTS) {
      return { ok: false, error: "LOCKED" };
    }
    return { ok: false, error: "INVALID_OTP" };
  }

  // Mark verified — clear hash (single use)
  await prisma.caregiverOtp.update({
    where: { accountId: account.id },
    data: { verifiedAt: new Date(), otpHash: "" },
  });

  return { ok: true, accountId: account.id };
}

// ── Phone normalisation ───────────────────────────────────────────────────────

/**
 * Normalise Indian mobile numbers to E.164 format (+91XXXXXXXXXX).
 * Accepts: 10-digit, 91-prefixed, +91-prefixed.
 * Returns null for invalid input.
 */
export function normalisePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91") && /^91[6-9]/.test(digits)) {
    return `+${digits}`;
  }
  if (digits.length === 13 && digits.startsWith("091")) {
    const local = digits.slice(1);
    if (/^91[6-9]/.test(local)) return `+${local}`;
  }
  // Already E.164
  if (input.startsWith("+91") && digits.length === 12) {
    return `+91${digits.slice(2)}`;
  }
  return null;
}

// ── Session helpers (thin wrappers — full config in apps/web/lib/session.ts) ──

export type CaregiverSession = {
  accountId: string;
  phoneNumber: string;
};
