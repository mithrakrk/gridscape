---
name: validate-ai-pipeline
description: Inspect OCR/extraction/judge flow, identify confidence thresholds and human-review paths, update AI pipeline docs, ensure low-confidence cases are handled, add validation cases.
trigger: /validate-ai-pipeline
steps:
  - 1. Read docs/ai-pipeline.md fully
  - 2. Review extraction and judge code in packages/ai
  - 3. Verify confidence thresholds are correctly applied
  - 4. Verify low-confidence cases trigger correction flow (not silent failure)
  - 5. Verify LLM-as-judge cross-references OCR text correctly
  - 6. Add or update validation test cases
  - 7. Update docs/ai-pipeline.md with findings
  - 8. Update docs/qa.md with any issues found
---

# Workflow: Validate AI Pipeline

Use this workflow before any AI pipeline change goes to production, or when debugging extraction quality issues.

## Steps

### 1. Read the pipeline doc
Read `docs/ai-pipeline.md` fully. Understand:
- The full flow: OCR → Extraction → Judge → Confidence → Correction queue
- Current confidence thresholds
- Open questions listed in the doc

### 2. Review pipeline code
Inspect:
- `packages/ai/src/ocr/` — OCR provider interface and implementation
- `packages/ai/src/extraction/` — extraction prompt and output schema
- `packages/ai/src/judge/` — judge prompt, output schema, confidence calculation
- `apps/worker/jobs/` — how jobs chain these steps together

### 3. Verify confidence thresholds
- Is the threshold (0.85 overall, per-field flags) correctly applied?
- Are threshold values documented and easy to adjust?
- Are thresholds provisional and marked as such?

### 4. Verify low-confidence handling
- Low-confidence extractions MUST trigger the correction queue — never silent failure
- Verify the WhatsApp correction notification is sent with specific field names and extracted values
- Verify the correction flow saves `correctedValue` with audit trail

### 5. Verify judge cross-reference
- Run judge on a sample extraction where a field was hallucinated
- Verify judge catches it (confidence < threshold)
- Verify judge output matches the schema in docs/ai-pipeline.md

### 6. Add validation test cases
Add to `tests/integration/extraction.test.ts` or `tests/unit/judge.test.ts`:
- High-confidence case: clean document → auto-accepted
- Low-confidence case: blurry document → correction triggered
- Hallucination case: extracted value not in OCR text → judge flags it
- Empty OCR case: no text extracted → EXTRACTION_FAILED state

### 7. Update docs/ai-pipeline.md
- Record findings
- Update open questions if new ones discovered
- Note any threshold calibration changes

### 8. Update docs/qa.md
- Log any bugs found during validation
- Mark severity per the severity definitions
