# Data Model — Kavach

> Last updated: 2026-05-16

All queries and operations are scoped within the Account → PatientProfile → Record hierarchy.

---

## Entity Relationships

```
Account
  └── PatientProfile (many per account)
        ├── Record (many per patient)
        │     ├── ExtractedField (many per record)
        │     └── AuditEvent (on this record)
        └── SummaryArtifact (many per patient)

Account
  └── ConsentRecord (many per account)
  └── AuditEvent (on account-level events)

AccessToken (for doctor portal sessions)
  └── linked to PatientProfile (scoped access)
```

---

## Entities

### Account
```prisma
model Account {
  id             String          @id @default(cuid())
  email          String?         @unique
  phoneNumber    String          @unique
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  deletedAt      DateTime?       // soft delete for erasure
  patients       PatientProfile[]
  consents       ConsentRecord[]
  auditEvents    AuditEvent[]
}
```

### PatientProfile
```prisma
model PatientProfile {
  id             String    @id @default(cuid())
  accountId      String
  account        Account   @relation(fields: [accountId], references: [id])
  name           String
  dateOfBirth    DateTime?
  bloodGroup     String?
  weightKg       Float?
  allergies      String[]
  isArchived     Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime? // erasure tombstone
  records        Record[]
  summaries      SummaryArtifact[]
  accessTokens   AccessToken[]
}
```

### Record
```prisma
model Record {
  id               String      @id @default(cuid())
  patientId        String
  patient          PatientProfile @relation(fields: [patientId], references: [id])
  rawFileUrl       String      // S3 URL — always preserved
  rawFileKey       String      // S3 key for lifecycle management
  recordType       RecordType  // lab_report | prescription | consultation | imaging | discharge
  recordDate       DateTime?
  extractedFields  ExtractedField[]
  confidenceScore  Float?      // 0.0–1.0 from judge step
  judgeVerified    Boolean     @default(false)
  manuallyVerified Boolean     @default(false)
  correctionNote   String?
  provenance       Json?       // source, upload method, pipeline version
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  deletedAt        DateTime?   // erasure tombstone
  auditEvents      AuditEvent[]
}

enum RecordType {
  LAB_REPORT
  PRESCRIPTION
  CONSULTATION
  IMAGING
  DISCHARGE
  OTHER
}
```

### ExtractedField
```prisma
model ExtractedField {
  id              String   @id @default(cuid())
  recordId        String
  record          Record   @relation(fields: [recordId], references: [id])
  fieldName       String   // e.g. "hba1c", "medication_name", "doctor_name"
  rawValue        String   // original extracted string
  normalizedValue String?  // cleaned/parsed value
  unit            String?
  referenceRange  String?
  confidence      Float    // 0.0–1.0 per field
  isLowConfidence Boolean  @default(false)
  correctedValue  String?  // set by caregiver if corrected
  correctedAt     DateTime?
  correctedBy     String?  // accountId
}
```

### SummaryArtifact
```prisma
model SummaryArtifact {
  id          String         @id @default(cuid())
  patientId   String
  patient     PatientProfile @relation(fields: [patientId], references: [id])
  pdfUrl      String         // S3 URL of generated PDF
  pdfKey      String
  generatedAt DateTime       @default(now())
  expiresAt   DateTime?      // optional TTL on the PDF itself
  summaryJson Json           // structured summary data used for generation
  version     Int            @default(1)
}
```

### AuditEvent
```prisma
model AuditEvent {
  id          String   @id @default(cuid())
  accountId   String?
  account     Account? @relation(fields: [accountId], references: [id])
  recordId    String?
  record      Record?  @relation(fields: [recordId], references: [id])
  eventType   String   // e.g. RECORD_UPLOADED, FIELD_CORRECTED, PORTAL_ACCESSED, CONSENT_GIVEN, ERASURE_REQUESTED
  actor       String?  // accountId or "system" or "doctor:{tokenId}"
  metadata    Json?    // non-PHI context (file size, record type, confidence score tier)
  createdAt   DateTime @default(now())
}
```

### AccessToken (Doctor Portal)
```prisma
model AccessToken {
  id          String         @id @default(cuid())
  patientId   String
  patient     PatientProfile @relation(fields: [patientId], references: [id])
  token       String         @unique
  otpHash     String?        // bcrypt hash of OTP — cleared after use
  otpVerified Boolean        @default(false)
  expiresAt   DateTime       // 8 hours from creation by default
  usedAt      DateTime?
  revokedAt   DateTime?
  ipAddress   String?        // for audit purposes
  createdAt   DateTime       @default(now())
}
```

### ConsentRecord
```prisma
model ConsentRecord {
  id            String   @id @default(cuid())
  accountId     String
  account       Account  @relation(fields: [accountId], references: [id])
  consentType   String   // e.g. DATA_PROCESSING, PORTAL_SHARING, MARKETING
  givenAt       DateTime @default(now())
  withdrawnAt   DateTime?
  ipAddress     String?
  userAgent     String?
  consentText   String   // exact consent language shown to user at time of consent
  version       String   // consent document version
}
```

---

## Deletion and Erasure States

| State | How represented |
|---|---|
| Soft deleted | `deletedAt` timestamp set; data retained for retention period |
| Erasure requested | AuditEvent of type `ERASURE_REQUESTED` created; workflow triggered |
| Tombstoned | PHI fields nulled/cleared; record shell retained for audit continuity |
| Raw file lifecycle | S3 lifecycle policy applied to raw file key; deletion logged |

> **Legal review required:** Retention periods, specific erasure mechanics, and audit trail preservation requirements under DPDP Act 2023 need to be confirmed with a qualified legal advisor before implementing the erasure flow.

---

## Notes

- All timestamps are UTC.
- All IDs are cuid() for privacy (non-sequential, non-guessable).
- `provenance` JSON on Record stores: upload channel (whatsapp/web), pipeline version, OCR provider used, extraction model used.
- `summaryJson` on SummaryArtifact stores the full structured summary at generation time for reproducibility.
