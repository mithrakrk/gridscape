import type { OcrResult } from "@kavach/types";

/**
 * Provider-agnostic OCR interface.
 * Implementations: AwsTextractProvider, GoogleCloudVisionProvider
 */
export interface OcrProvider {
  /**
   * Extract text from an S3 file.
   * @param s3Key - The S3 object key of the raw file
   * @returns OcrResult with raw text, confidence, and word blocks
   */
  extract(s3Key: string): Promise<OcrResult>;
}

// PROVISIONAL: AWS Textract is the default. Compare with Google Cloud Vision
// on Indian medical report samples before finalising.
export class AwsTextractProvider implements OcrProvider {
  async extract(s3Key: string): Promise<OcrResult> {
    // TODO: Implement AWS Textract integration
    // - Use @aws-sdk/client-textract
    // - Call AnalyzeDocument or StartDocumentAnalysis
    // - Map Textract Block types to OcrResult
    throw new Error("AwsTextractProvider not yet implemented");
  }
}
