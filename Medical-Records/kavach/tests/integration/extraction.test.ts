// tests/integration/extraction.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Integration tests for OCR -> Extraction -> Judge pipeline.

import { describe, it, expect, vi } from "vitest";
import { isHighConfidence } from "../../packages/ai/src/judge/index";
import type { JudgeResult, OcrResult, ExtractionResult } from "@kavach/types";

// Synthetic OCR output for a lab report (not real PHI)
const SYNTHETIC_LAB_REPORT_OCR: OcrResult = {
  rawText: "Patient: Arjun Mehta (Test)\nDate: 15-Mar-2024\nHbA1c: 7.2%\nFasting Glucose: 118 mg/dL\nDoctor: Dr. Ravi Kumar (Test)",
  confidence: 0.94,
  blocks: [],
};

const SYNTHETIC_HIGH_CONFIDENCE_EXTRACTION: ExtractionResult = {
  recordType: "LAB_REPORT",
  overallConfidence: 0.92,
  fields: [
    { id: "f1", fieldName: "hba1c", rawValue: "7.2%", normalizedValue: "7.2", unit: "%", referenceRange: "4.0-5.6%", confidence: 0.95, isLowConfidence: false, correctedValue: null },
    { id: "f2", fieldName: "fasting_glucose", rawValue: "118 mg/dL", normalizedValue: "118", unit: "mg/dL", referenceRange: "70-100 mg/dL", confidence: 0.93, isLowConfidence: false, correctedValue: null },
  ],
};

const SYNTHETIC_LOW_CONFIDENCE_EXTRACTION: ExtractionResult = {
  recordType: "PRESCRIPTION",
  overallConfidence: 0.65,
  fields: [
    { id: "f3", fieldName: "medication_name", rawValue: "Metformin", normalizedValue: "Metformin", unit: null, referenceRange: null, confidence: 0.90, isLowConfidence: false, correctedValue: null },
    { id: "f4", fieldName: "dosage", rawValue: "250m", normalizedValue: null, unit: null, referenceRange: null, confidence: 0.42, isLowConfidence: true, correctedValue: null },
  ],
};

describe("Extraction pipeline — confidence classification", () => {
  it("high-confidence extraction should be auto-accepted", () => {
    const judgeResult: JudgeResult = {
      overallConfidence: 0.92,
      fieldJudgments: [
        { fieldName: "hba1c", extractedValue: "7.2%", foundInOcr: true, confidence: 0.95, concern: null },
        { fieldName: "fasting_glucose", extractedValue: "118", foundInOcr: true, confidence: 0.93, concern: null },
      ],
    };
    expect(isHighConfidence(judgeResult)).toBe(true);
  });

  it("low-confidence extraction must NOT be auto-accepted (requires caregiver correction)", () => {
    const judgeResult: JudgeResult = {
      overallConfidence: 0.65,
      fieldJudgments: [
        { fieldName: "dosage", extractedValue: "250m", foundInOcr: false, confidence: 0.42, concern: "Value not clearly legible — potential OCR misread" },
      ],
    };
    // This is the critical safety check — never auto-accept low confidence
    expect(isHighConfidence(judgeResult)).toBe(false);
  });

  it("hallucinated field (not in OCR) should cause low confidence", () => {
    const judgeResult: JudgeResult = {
      overallConfidence: 0.70,
      fieldJudgments: [
        { fieldName: "doctor_name", extractedValue: "Dr. Smith", foundInOcr: false, confidence: 0.30, concern: "Name not found in OCR text — possible hallucination" },
      ],
    };
    expect(isHighConfidence(judgeResult)).toBe(false);
  });
});
