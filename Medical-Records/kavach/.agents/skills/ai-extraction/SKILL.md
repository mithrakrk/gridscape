---
name: ai-extraction
description: OCR/extraction pipeline design, judge-step validation, confidence scoring, correction workflows, provenance tracking.
use_when:
  - Designing or modifying the OCR, extraction, or judge pipeline
  - Debugging extraction quality issues
  - Calibrating confidence thresholds
  - Designing the caregiver correction flow
outputs:
  - Updated docs/ai-pipeline.md
  - Updated packages/ai implementation
  - Integration tests in tests/integration/extraction.test.ts
  - Open questions documented in docs/ai-pipeline.md
---

# Skill: AI Extraction

## When to Apply
Apply this skill when working on any part of the OCR → LLM extraction → LLM-as-judge pipeline.

## Key Principles

### Never Silent Failure
Low-confidence extractions MUST trigger the caregiver correction flow. Silent omission of fields is a patient safety risk — a missing medication dosage in a summary could lead to incorrect treatment.

### Judge is Mandatory
The LLM-as-judge step is not optional. Every extraction must be validated before the data enters the database as judgeVerified=true. The judge must:
- Cross-reference each extracted field against raw OCR text
- Flag fields not found in the OCR output (potential hallucinations)
- Produce per-field confidence scores

### Confidence Handling
- ≥ 0.85 overall AND no low-confidence fields: auto-accept
- < 0.85 overall OR any field < 0.85: queue for caregiver correction
- OCR returns no text: mark EXTRACTION_FAILED, notify caregiver to re-upload
- Thresholds are provisional — calibrate with real Indian medical report samples

### Provenance Model
Every Record must store provenance JSON:
```json
{
  "uploadChannel": "whatsapp",
  "ocrProvider": "aws-textract",
  "extractionModel": "gpt-4o-2024-11-20",
  "judgeModel": "gpt-4o-2024-11-20",
  "pipelineVersion": "0.1.0",
  "correctedByCaregiver": false
}
```

### Lab Marker Configuration
- Lab marker sets (condition-linked markers) are PROVISIONAL until HCP-validated
- Mark in code: `// PROVISIONAL: requires HCP interview validation`
- Do not hardcode as final — use a configurable marker set structure

### Provider Agnosticism
The OCR and LLM interfaces in `packages/ai` must be provider-agnostic. The concrete provider is injected via configuration. This allows swapping Textract for Cloud Vision or GPT-4o for Gemini without changing business logic.
