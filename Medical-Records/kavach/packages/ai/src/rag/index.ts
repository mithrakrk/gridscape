import type { DoctorSummary, PatientSummary } from "@kavach/types";

/**
 * RAG pipeline for doctor summary generation.
 * Retrieves relevant records from patient history and generates structured summary.
 */
export interface SummaryGenerator {
  /**
   * Generate a structured 7-section doctor summary for a patient.
   * @param patientId - The patient profile ID
   * @returns Structured DoctorSummary with all 7 sections
   */
  generateSummary(patientId: string): Promise<DoctorSummary>;
}

// TODO: Implement using LangChain or custom RAG with pgvector
// Steps:
// 1. Retrieve all verified records for patient (from DB)
// 2. Generate embeddings for record content (if needed for semantic retrieval)
// 3. Build context: active conditions, medications, lab values, recent visits
// 4. Call LLM with structured summary prompt
// 5. Validate and return DoctorSummary

export class LlmSummaryGenerator implements SummaryGenerator {
  async generateSummary(patientId: string): Promise<DoctorSummary> {
    throw new Error("LlmSummaryGenerator not yet implemented");
  }
}
