// apps/worker/jobs/ingestion.ts
// Background job: OCR -> Extraction -> Judge -> Store
// Triggered after a document is uploaded via WhatsApp and attributed to a patient.

export const INGESTION_QUEUE_NAME = "kavach:ingestion";

export interface IngestionJobData {
  recordId: string;
  patientId: string;
  accountId: string;
  s3Key: string;
  recordType: string;
}

// TODO: Create BullMQ Queue and Worker when implementing
// import { Queue, Worker } from "bullmq";
// export const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, { connection: redisConnection });

export const ingestionQueue = {
  add: async (data: IngestionJobData) => {
    // TODO: Add job to BullMQ queue
    console.log("[ingestion] job queued (stub):", data.recordId);
  },
};

// Job processor — runs OCR -> Extraction -> Judge pipeline
async function processIngestionJob(data: IngestionJobData): Promise<void> {
  const { recordId, s3Key, recordType } = data;

  // 1. OCR
  // const ocrResult = await ocrProvider.extract(s3Key);
  // if (!ocrResult.rawText) { mark record EXTRACTION_FAILED; notify caregiver; return; }

  // 2. LLM Extraction
  // const extraction = await extractionProvider.extract(ocrResult, recordType);

  // 3. LLM-as-Judge
  // const judgeResult = await judgeProvider.validate(ocrResult, extraction);

  // 4. Confidence classification
  // if (isHighConfidence(judgeResult)) {
  //   mark record VERIFIED; store extracted fields
  // } else {
  //   mark record LOW_CONFIDENCE; queue correction notification
  //   NEVER silently discard — a missed dosage is a patient safety risk
  // }

  // 5. Audit log
  // await logAuditEvent({ eventType: "RECORD_UPLOADED", recordId, ... });
  throw new Error("processIngestionJob not yet implemented");
}
