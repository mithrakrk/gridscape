-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('LAB_REPORT', 'PRESCRIPTION', 'CONSULTATION', 'IMAGING', 'DISCHARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('PENDING', 'PROCESSING', 'EXTRACTION_FAILED', 'LOW_CONFIDENCE', 'VERIFIED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "bloodGroup" TEXT,
    "weightKg" DOUBLE PRECISION,
    "allergies" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "rawFileUrl" TEXT NOT NULL,
    "rawFileKey" TEXT NOT NULL,
    "recordType" "RecordType" NOT NULL DEFAULT 'OTHER',
    "recordDate" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'PENDING',
    "confidenceScore" DOUBLE PRECISION,
    "judgeVerified" BOOLEAN NOT NULL DEFAULT false,
    "manuallyVerified" BOOLEAN NOT NULL DEFAULT false,
    "correctionNote" TEXT,
    "provenance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedField" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "rawValue" TEXT NOT NULL,
    "normalizedValue" TEXT,
    "unit" TEXT,
    "referenceRange" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isLowConfidence" BOOLEAN NOT NULL DEFAULT false,
    "correctedValue" TEXT,
    "correctedAt" TIMESTAMP(3),
    "correctedBy" TEXT,

    CONSTRAINT "ExtractedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryArtifact" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfKey" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "summaryJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SummaryArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessToken" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "otpHash" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "consentText" TEXT NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "recordId" TEXT,
    "eventType" TEXT NOT NULL,
    "actor" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverOtp" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_phoneNumber_key" ON "Account"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Account_phoneNumber_idx" ON "Account"("phoneNumber");

-- CreateIndex
CREATE INDEX "PatientProfile_accountId_idx" ON "PatientProfile"("accountId");

-- CreateIndex
CREATE INDEX "Record_patientId_idx" ON "Record"("patientId");

-- CreateIndex
CREATE INDEX "Record_patientId_deletedAt_idx" ON "Record"("patientId", "deletedAt");

-- CreateIndex
CREATE INDEX "ExtractedField_recordId_idx" ON "ExtractedField"("recordId");

-- CreateIndex
CREATE INDEX "SummaryArtifact_patientId_idx" ON "SummaryArtifact"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_token_key" ON "AccessToken"("token");

-- CreateIndex
CREATE INDEX "AccessToken_token_idx" ON "AccessToken"("token");

-- CreateIndex
CREATE INDEX "AccessToken_patientId_idx" ON "AccessToken"("patientId");

-- CreateIndex
CREATE INDEX "ConsentRecord_accountId_idx" ON "ConsentRecord"("accountId");

-- CreateIndex
CREATE INDEX "AuditEvent_accountId_idx" ON "AuditEvent"("accountId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_idx" ON "AuditEvent"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverOtp_accountId_key" ON "CaregiverOtp"("accountId");

-- CreateIndex
CREATE INDEX "CaregiverOtp_accountId_idx" ON "CaregiverOtp"("accountId");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedField" ADD CONSTRAINT "ExtractedField_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryArtifact" ADD CONSTRAINT "SummaryArtifact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverOtp" ADD CONSTRAINT "CaregiverOtp_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
