import crypto from "crypto";
import { prisma } from "@kavach/db";

const OTP_EXPIRY_MINUTES = 10;
const TOKEN_EXPIRY_HOURS = 8;
const MAX_OTP_ATTEMPTS = 3;

/** Generate a 6-digit OTP */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Generate a cryptographically random portal token */
export function generatePortalToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** Create an AccessToken for doctor portal access */
export async function createPortalAccessToken(patientId: string, ipAddress?: string) {
  const token = generatePortalToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  return prisma.accessToken.create({
    data: { patientId, token, expiresAt, ipAddress },
  });
}

/** Verify a portal access token — returns the token record if valid */
export async function verifyPortalToken(token: string) {
  const record = await prisma.accessToken.findUnique({ where: { token } });
  if (!record) return { valid: false, reason: "NOT_FOUND" };
  if (record.revokedAt) return { valid: false, reason: "REVOKED" };
  if (record.expiresAt < new Date()) return { valid: false, reason: "EXPIRED" };
  return { valid: true, token: record };
}

/** Verify an OTP against a stored hash — single use, max 3 attempts */
export async function verifyOtp(
  tokenId: string,
  enteredOtp: string,
  storedHash: string
): Promise<{ success: boolean; reason?: string }> {
  // TODO: Implement bcrypt.compare when bcryptjs is added
  // Placeholder: direct comparison for scaffold (DO NOT USE IN PRODUCTION)
  const match = enteredOtp === storedHash;
  if (!match) {
    await prisma.accessToken.update({
      where: { id: tokenId },
      data: { otpAttempts: { increment: 1 } },
    });
    const updated = await prisma.accessToken.findUnique({ where: { id: tokenId } });
    if ((updated?.otpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
      await prisma.accessToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
      });
      return { success: false, reason: "LOCKED" };
    }
    return { success: false, reason: "INVALID" };
  }
  await prisma.accessToken.update({
    where: { id: tokenId },
    data: { otpVerified: true, usedAt: new Date(), otpHash: null },
  });
  return { success: true };
}
