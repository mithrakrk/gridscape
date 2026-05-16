import { prisma } from "@kavach/db";

// Audit event types
export const AUDIT_EVENTS = {
  RECORD_UPLOADED: "RECORD_UPLOADED",
  FIELD_CORRECTED: "FIELD_CORRECTED",
  LOW_CONFIDENCE_FLAGGED: "LOW_CONFIDENCE_FLAGGED",
  PORTAL_ACCESSED: "PORTAL_ACCESSED",
  PORTAL_OTP_LOCKOUT: "PORTAL_OTP_LOCKOUT",
  CONSENT_GIVEN: "CONSENT_GIVEN",
  CONSENT_WITHDRAWN: "CONSENT_WITHDRAWN",
  ERASURE_REQUESTED: "ERASURE_REQUESTED",
  ERASURE_COMPLETED: "ERASURE_COMPLETED",
  RECORD_DELETION_REQUESTED: "RECORD_DELETION_REQUESTED",
  PROFILE_ERASURE_REQUESTED: "PROFILE_ERASURE_REQUESTED",
} as const;

export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

/**
 * Log an audit event.
 * IMPORTANT: metadata must contain NO PHI — only record IDs, event types,
 * confidence tiers, file types. Never log patient names, field values, or raw content.
 */
export async function logAuditEvent(params: {
  eventType: AuditEventType;
  accountId?: string;
  recordId?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      eventType: params.eventType,
      accountId: params.accountId,
      recordId: params.recordId,
      actor: params.actor,
      metadata: params.metadata,
    },
  });
}

/**
 * Record a consent event.
 * Stores the exact consent text shown to the user at the time of consent.
 */
export async function recordConsent(params: {
  accountId: string;
  consentType: string;
  consentText: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.consentRecord.create({
    data: {
      accountId: params.accountId,
      consentType: params.consentType,
      consentText: params.consentText,
      version: params.version,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

/**
 * Initiate erasure workflow for a patient profile.
 * LEGAL REVIEW REQUIRED: Retention periods and tombstoning mechanics
 * must be confirmed with a qualified legal advisor before production use.
 */
export async function requestPatientErasure(
  patientId: string,
  accountId: string
): Promise<void> {
  // Step 1: Log the erasure request
  await logAuditEvent({
    eventType: AUDIT_EVENTS.PROFILE_ERASURE_REQUESTED,
    accountId,
    actor: accountId,
    metadata: { patientId }, // patientId is internal ID, not PHI
  });

  // Step 2: Soft delete the profile (tombstone)
  await prisma.patientProfile.update({
    where: { id: patientId },
    data: { deletedAt: new Date() },
  });

  // Step 3: Revoke all active portal tokens for this patient
  await prisma.accessToken.updateMany({
    where: { patientId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  // TODO: Step 4: Soft delete all records for this patient
  // TODO: Step 5: Trigger S3 lifecycle policy for raw files (via queue job)
  // TODO: Step 6: Log ERASURE_COMPLETED after S3 cleanup is done
}
