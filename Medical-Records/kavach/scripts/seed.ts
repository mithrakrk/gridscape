/**
 * Kavach — Development Seed Script
 * Seeds the local database with SYNTHETIC test data only.
 * NEVER use real PHI — all data below is fictional.
 *
 * Run: npx ts-node scripts/seed.ts
 * Or:  npm run db:seed
 */

import { PrismaClient, RecordType, RecordStatus } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

async function main() {
  console.log("🌱 Seeding Kavach dev database with synthetic data...");

  // -- Account (synthetic caregiver) --
  const account = await prisma.account.upsert({
    where: { phoneNumber: "+919999000001" },
    update: {},
    create: {
      id: "cjtest001account001",
      phoneNumber: "+919999000001", // Synthetic — not a real number
      email: "test.caregiver@example.com",
    },
  });
  console.log("✅ Account:", account.id);

  // -- Patient 1: Arjun Mehta (Synthetic) --
  const patient1 = await prisma.patientProfile.upsert({
    where: { id: "cjtest001patient001" },
    update: {},
    create: {
      id: "cjtest001patient001",
      accountId: account.id,
      name: "Arjun Mehta (Synthetic)",
      dateOfBirth: new Date("1958-03-15"),
      bloodGroup: "O+",
      weightKg: 72,
      allergies: ["Penicillin"],
    },
  });
  console.log("✅ Patient 1:", patient1.name);

  // -- Patient 2: Meena Mehta (Synthetic) — multi-patient test --
  const patient2 = await prisma.patientProfile.upsert({
    where: { id: "cjtest002patient002" },
    update: {},
    create: {
      id: "cjtest002patient002",
      accountId: account.id,
      name: "Meena Mehta (Synthetic)",
      dateOfBirth: new Date("1960-07-22"),
      bloodGroup: "A+",
      weightKg: 58,
      allergies: [],
    },
  });
  console.log("✅ Patient 2:", patient2.name);

  // -- Record 1: Lab report (high confidence) --
  const record1 = await prisma.record.upsert({
    where: { id: "cjtest001record001" },
    update: {},
    create: {
      id: "cjtest001record001",
      patientId: patient1.id,
      rawFileUrl: "s3://kavach-test-bucket/synthetic/lab-report-001.jpg",
      rawFileKey: "synthetic/lab-report-001.jpg",
      recordType: RecordType.LAB_REPORT,
      recordDate: new Date("2024-03-15"),
      status: RecordStatus.VERIFIED,
      confidenceScore: 0.92,
      judgeVerified: true,
      manuallyVerified: false,
      provenance: {
        uploadChannel: "whatsapp",
        pipelineVersion: "0.1.0",
        ocrProvider: "aws-textract",
        extractionModel: "gpt-4o",
      },
    },
  });
  console.log("✅ Record 1:", record1.id, "(LAB_REPORT, VERIFIED)");

  // -- ExtractedFields for Record 1 --
  await prisma.extractedField.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "cjtest001field001",
        recordId: record1.id,
        fieldName: "hba1c",
        rawValue: "7.2%",
        normalizedValue: "7.2",
        unit: "%",
        referenceRange: "4.0-5.6%",
        confidence: 0.95,
        isLowConfidence: false,
      },
      {
        id: "cjtest001field002",
        recordId: record1.id,
        fieldName: "fasting_glucose",
        rawValue: "118 mg/dL",
        normalizedValue: "118",
        unit: "mg/dL",
        referenceRange: "70-100 mg/dL",
        confidence: 0.93,
        isLowConfidence: false,
      },
      {
        id: "cjtest001field003",
        recordId: record1.id,
        fieldName: "doctor_name",
        rawValue: "Dr. Ravi Kumar (Synthetic)",
        normalizedValue: "Dr. Ravi Kumar (Synthetic)",
        confidence: 0.9,
        isLowConfidence: false,
      },
    ],
  });
  console.log("✅ ExtractedFields for Record 1");

  // -- Record 2: Prescription (low confidence) --
  const record2 = await prisma.record.upsert({
    where: { id: "cjtest002record002" },
    update: {},
    create: {
      id: "cjtest002record002",
      patientId: patient1.id,
      rawFileUrl: "s3://kavach-test-bucket/synthetic/prescription-001.jpg",
      rawFileKey: "synthetic/prescription-001.jpg",
      recordType: RecordType.PRESCRIPTION,
      recordDate: new Date("2024-03-15"),
      status: RecordStatus.LOW_CONFIDENCE,
      confidenceScore: 0.65,
      judgeVerified: false,
      manuallyVerified: false,
      provenance: {
        uploadChannel: "whatsapp",
        pipelineVersion: "0.1.0",
        ocrProvider: "aws-textract",
        extractionModel: "gpt-4o",
      },
    },
  });
  console.log("✅ Record 2:", record2.id, "(PRESCRIPTION, LOW_CONFIDENCE)");

  // -- ExtractedFields for Record 2 (one low-confidence field) --
  await prisma.extractedField.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "cjtest002field001",
        recordId: record2.id,
        fieldName: "medication_name",
        rawValue: "Metformin",
        normalizedValue: "Metformin",
        confidence: 0.9,
        isLowConfidence: false,
      },
      {
        id: "cjtest002field002",
        recordId: record2.id,
        fieldName: "dosage",
        rawValue: "250m",
        normalizedValue: null,
        confidence: 0.42,
        isLowConfidence: true,
      },
      {
        id: "cjtest002field003",
        recordId: record2.id,
        fieldName: "frequency",
        rawValue: "Twice daily",
        normalizedValue: "Twice daily",
        confidence: 0.88,
        isLowConfidence: false,
      },
    ],
  });
  console.log("✅ ExtractedFields for Record 2");

  // -- Consent record --
  await prisma.consentRecord.create({
    data: {
      accountId: account.id,
      consentType: "DATA_PROCESSING",
      ipAddress: "127.0.0.1",
      userAgent: "Synthetic/Seed",
      consentText:
        "I consent to Kavach processing my family's medical records for the purposes of record storage and doctor summaries, in accordance with DPDP Act 2023.",
      version: "1.0",
    },
  });
  console.log("✅ ConsentRecord for account");

  // -- Audit events --
  await prisma.auditEvent.createMany({
    data: [
      {
        accountId: account.id,
        recordId: record1.id,
        eventType: "RECORD_UPLOADED",
        actor: account.id,
        metadata: { uploadChannel: "whatsapp", recordType: "LAB_REPORT" },
      },
      {
        accountId: account.id,
        recordId: record2.id,
        eventType: "RECORD_UPLOADED",
        actor: account.id,
        metadata: { uploadChannel: "whatsapp", recordType: "PRESCRIPTION" },
      },
      {
        accountId: account.id,
        recordId: record2.id,
        eventType: "LOW_CONFIDENCE_FLAGGED",
        actor: "system",
        metadata: { field: "dosage", confidence: 0.42 },
      },
    ],
  });
  console.log("✅ AuditEvents");

  console.log(
    "\n✨ Seed complete. Database has synthetic data for 1 account, 2 patients, 2 records."
  );
  console.log("   Run `npm run db:studio` to browse the database visually.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
