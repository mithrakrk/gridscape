import type { OcrResult, ExtractionResult, RecordType } from "@kavach/types";

/**
 * Provider-agnostic LLM extraction interface.
 * Implementations: OpenAiExtractionProvider, GeminiExtractionProvider
 */
export interface ExtractionProvider {
  /**
   * Extract structured fields from OCR output.
   * @param ocrResult - Raw OCR output
   * @param recordType - Classified record type for prompt context
   * @returns Structured extraction result with per-field confidence
   */
  extract(ocrResult: OcrResult, recordType: RecordType): Promise<ExtractionResult>;
}

// TODO: Implement with provider selected via env EXTRACTION_PROVIDER=openai|gemini
// Requires signed DPA with provider before using with real patient data.
// LEGAL REVIEW REQUIRED: Confirm DPA covers Indian health data processing.
export class OpenAiExtractionProvider implements ExtractionProvider {
  async extract(ocrResult: OcrResult, recordType: RecordType): Promise<ExtractionResult> {
    // TODO: Implement OpenAI GPT-4o structured output extraction
    // - Build prompt with OCR text + record type context + field schema
    // - Use function calling / structured output mode
    // - Return typed ExtractionResult
    throw new Error("OpenAiExtractionProvider not yet implemented");
  }
}
