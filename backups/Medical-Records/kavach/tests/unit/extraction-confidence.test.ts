// tests/unit/extraction-confidence.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Tests extraction confidence classification logic.

import { describe, it, expect } from "vitest";
import { isHighConfidence, CONFIDENCE_THRESHOLD } from "../../packages/ai/src/judge/index";
import type { JudgeResult } from "@kavach/types";

describe("Confidence classification", () => {
  it("should classify HIGH confidence when overall and all fields are above threshold", () => {
    const result: JudgeResult = {
      overallConfidence: 0.92,
      fieldJudgments: [
        { fieldName: "hba1c", extractedValue: "7.2%", foundInOcr: true, confidence: 0.95, concern: null },
        { fieldName: "doctor_name", extractedValue: "Dr. Ravi Kumar", foundInOcr: true, confidence: 0.90, concern: null },
      ],
    };
    expect(isHighConfidence(result)).toBe(true);
  });

  it("should classify LOW confidence when overall is below threshold", () => {
    const result: JudgeResult = {
      overallConfidence: 0.72,
      fieldJudgments: [
        { fieldName: "dosage", extractedValue: "250m", foundInOcr: false, confidence: 0.45, concern: "Value not clearly legible" },
      ],
    };
    expect(isHighConfidence(result)).toBe(false);
  });

  it("should classify LOW confidence when any field is below threshold, even if overall is high", () => {
    const result: JudgeResult = {
      overallConfidence: 0.88,
      fieldJudgments: [
        { fieldName: "hba1c", extractedValue: "7.2%", foundInOcr: true, confidence: 0.95, concern: null },
        { fieldName: "dosage", extractedValue: "500mg", foundInOcr: false, confidence: 0.60, concern: "Not found in OCR text" },
      ],
    };
    expect(isHighConfidence(result)).toBe(false);
  });

  it("should use the correct threshold value", () => {
    expect(CONFIDENCE_THRESHOLD).toBe(0.85);
  });
});
