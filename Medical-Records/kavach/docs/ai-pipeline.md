# AI Pipeline — Kavach

> Last updated: 2026-05-16

---

## Overview

The AI pipeline processes medical documents from raw image/PDF through to structured, validated data ready for summary generation.

```
WhatsApp Upload
     │
     ▼
[Ingestion Queue]
     │
     ▼
[OCR Stage] ──────► raw text + word-level coordinates
     │
     ▼
[LLM Extraction Stage] ──► structured JSON fields
     │
     ▼
[LLM-as-Judge Stage] ──► confidence scores per field + overall score
     │
     ├─── HIGH CONFIDENCE (≥0.85) ──────────────────► auto-accepted → stored
     │
     └─── LOW CONFIDENCE (<0.85) ──► [Correction Queue] ──► caregiver notified via WhatsApp
                                              │
                                    caregiver types correction
                                    or re-uploads clearer photo
                                              │
                                       re-runs extraction
                                              │
                                         stored + verified

[RAG Summary Generation]
     │  reads verified + accepted records
     ▼
structured summary → [PDF Render] → shareable PDF
```

---

## 1. Ingestion Flow

1. WhatsApp webhook receives media attachment (image JPEG/PNG or PDF)
2. File downloaded to temp storage, validated (type, size limits)
3. File uploaded to S3 (raw_file_key assigned, encrypted at rest)
4. Record created in DB: `recordType=PENDING`, `rawFileUrl` set
5. Ingestion job queued (BullMQ)
6. AuditEvent: `RECORD_UPLOADED`

---

## 2. OCR Stage (`packages/ai/ocr`)

- **Interface:** `OcrProvider.extract(fileKey: string): Promise<OcrResult>`
- **Default implementation:** AWS Textract (Mumbai region)
- **Alternative:** Google Cloud Vision (fallback, configured via env)
- **Output:** `{ rawText: string, blocks: TextBlock[], confidence: number }`
- Textract preferred for Indian medical report layouts — better table extraction
- OCR result stored temporarily for judge stage cross-reference

---

## 3. Extraction Stage (`packages/ai/extraction`)

- **Interface:** `ExtractionProvider.extract(ocrResult: OcrResult, recordType: RecordType): Promise<ExtractionResult>`
- **Model:** GPT-4o or Gemini (provider-agnostic via interface)
- **Prompt:** Structured prompt with examples, field schema, and record type context
- **Output schema:**
```json
{
  "patientName": { "value": "...", "confidence": 0.9 },
  "recordDate": { "value": "2024-03-15", "confidence": 0.95 },
  "doctorName": { "value": "...", "confidence": 0.8 },
  "recordType": "LAB_REPORT",
  "fields": [
    {
      "fieldName": "hba1c",
      "rawValue": "7.2%",
      "normalizedValue": "7.2",
      "unit": "%",
      "referenceRange": "4.0–5.6%",
      "confidence": 0.92
    }
  ]
}
```

---

## 4. Judge Stage (`packages/ai/judge`)

- **Interface:** `JudgeProvider.validate(ocrResult: OcrResult, extraction: ExtractionResult): Promise<JudgeResult>`
- **Model:** Same LLM family, separate call with explicit judge persona
- **Task:** Cross-reference each extracted field against raw OCR text; identify hallucinations or misreads
- **Output:**
```json
{
  "overallConfidence": 0.88,
  "fieldJudgments": [
    {
      "fieldName": "hba1c",
      "extractedValue": "7.2",
      "foundInOcr": true,
      "confidence": 0.95,
      "concern": null
    },
    {
      "fieldName": "medicationDosage",
      "extractedValue": "500mg",
      "foundInOcr": false,
      "confidence": 0.42,
      "concern": "Value not clearly legible in source"
    }
  ]
}
```

---

## 5. Confidence Handling

| Score | Action |
|---|---|
| ≥ 0.85 overall | Auto-accepted — stored as verified |
| < 0.85 overall | Queued for caregiver correction |
| < 0.85 on specific field | Field flagged even if overall score is high |
| OCR failure (no text extracted) | Record marked `EXTRACTION_FAILED`; caregiver asked to re-upload |

> **Note:** Confidence thresholds are provisional. Calibrate based on real-world extraction results during testing. Medical data accuracy must take priority over extraction throughput.

---

## 6. Correction Loop (`packages/ai`, `packages/whatsapp`)

1. Low-confidence record → AuditEvent: `LOW_CONFIDENCE_FLAGGED`
2. WhatsApp message sent to caregiver:
   - "We couldn't read [field] clearly from [record type] dated [date]. Can you confirm: [extracted value]? Reply with the correct value or send a clearer photo."
3. Caregiver responds:
   - **Text reply:** correctedValue written to ExtractedField; `correctedAt` and `correctedBy` set
   - **Photo re-upload:** triggers fresh extraction on new file, linked to same record
4. AuditEvent: `FIELD_CORRECTED` with original and corrected values preserved
5. Record marked `manuallyVerified = true`

---

## 7. RAG Summary Generation (`packages/ai/rag`)

- **Trigger:** Caregiver requests summary for a patient in PWA
- **Retrieval:** Vector search over patient's verified record fields using pgvector
- **Context assembly:** Retrieves: active conditions, current medications, recent lab values, recent visits, upcoming appointments
- **Prompt:** Summary generation prompt with patient context + retrieval results
- **Output:** Structured summary JSON (7 sections per doctor-summary spec)
- **PDF:** Passed to `packages/pdf` for rendering

---

## 8. Provenance Model

Every Record stores a `provenance` JSON field:
```json
{
  "uploadChannel": "whatsapp",
  "uploadedAt": "2024-03-15T10:23:00Z",
  "ocrProvider": "aws-textract",
  "ocrVersion": "1.0",
  "extractionModel": "gpt-4o-2024-11-20",
  "judgeModel": "gpt-4o-2024-11-20",
  "pipelineVersion": "0.1.0",
  "correctedByCaregiver": false
}
```

---

## 9. Open Questions (Requiring Research)

- [ ] Which OCR provider (Textract vs Vision) performs better on Indian medical report layouts? Run comparison on sample Indian lab reports.
- [ ] What extraction prompt structure yields best results for Indian prescription formats (handwritten vs printed)?
- [ ] What are the correct condition-linked lab marker sets? **Requires HCP interviews before coding.**
- [ ] What confidence threshold (0.85?) is appropriate for medical data? Calibrate with real data.
- [ ] Which LLM provider has a data processing agreement that covers Indian health data?
- [ ] Should embeddings be stored in pgvector (same RDS) or a dedicated vector store for scale?
