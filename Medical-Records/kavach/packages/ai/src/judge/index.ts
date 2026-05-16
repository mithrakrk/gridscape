import type { OcrResult, ExtractionResult, JudgeResult } from "@kavach/types";

// Confidence threshold for auto-acceptance.
// PROVISIONAL: calibrate with real Indian medical report samples.
export const CONFIDENCE_THRESHOLD = 0.85;

/**
 * Provider-agnostic LLM-as-judge interface.
 * The judge validates extraction output against raw OCR text.
 * Low-confidence fields and potential hallucinations are flagged.
 */
export interface JudgeProvider {
  /**
   * Validate extraction against OCR source.
   * @param ocrResult - Raw OCR text for cross-reference
   * @param extraction - Extraction result to validate
   * @returns JudgeResult with per-field confidence and concerns
   */
  validate(ocrResult: OcrResult, extraction: ExtractionResult): Promise<JudgeResult>;
}

/**
 * Classify confidence level based on judge result.
 * Returns true if the record should be auto-accepted.
 * Returns false if caregiver correction is required.
 *
 * NEVER silently discard low-confidence extractions.
 * A low-confidence result MUST trigger the correction flow.
 */
export function isHighConfidence(judgeResult: JudgeResult): boolean {
  if (judgeResult.overallConfidence < CONFIDENCE_THRESHOLD) return false;
  const hasLowConfidenceField = judgeResult.fieldJudgments.some(
    (j) => j.confidence < CONFIDENCE_THRESHOLD
  );
  return !hasLowConfidenceField;
}

export class OpenAiJudgeProvider implements JudgeProvider {
  async validate(ocrResult: OcrResult, extraction: ExtractionResult): Promise<JudgeResult> {
    // TODO: Implement LLM-as-judge
    // - Separate LLM call with explicit judge persona
    // - Cross-reference each extracted field against raw OCR text
    // - Flag fields not found in OCR (potential hallucinations)
    throw new Error("OpenAiJudgeProvider not yet implemented");
  }
}
