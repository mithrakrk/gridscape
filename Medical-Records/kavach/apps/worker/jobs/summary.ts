// apps/worker/jobs/summary.ts
// Background job: RAG -> Summary generation -> PDF rendering -> S3 upload

export const SUMMARY_QUEUE_NAME = "kavach:summary";

export interface SummaryJobData {
  patientId: string;
  accountId: string;
  requestedBy: string; // accountId of caregiver who triggered
}

export const summaryQueue = {
  add: async (data: SummaryJobData) => {
    console.log("[summary] job queued (stub):", data.patientId);
  },
};

async function processSummaryJob(data: SummaryJobData): Promise<void> {
  // 1. Retrieve all verified records for patient (RAG retrieval)
  // 2. Generate structured summary JSON via LLM
  // 3. Render PDF with Puppeteer
  // 4. Upload PDF to S3
  // 5. Create SummaryArtifact record in DB
  // 6. Create AccessToken (8h TTL)
  // 7. Re-render PDF with QR code + portal link embedded
  // 8. Send PDF to caregiver via WhatsApp
  throw new Error("processSummaryJob not yet implemented");
}
