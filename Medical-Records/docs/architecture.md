# Architecture — Medical Records

> Last updated: 2026-05-16

---

## System Overview

```
[Caregiver] ──WhatsApp──► [WhatsApp Bot] ──► [Ingestion Pipeline]
                                                     │
                                              OCR + LLM Extraction
                                              LLM-as-Judge (validation)
                                                     │
                                              [Database (AWS Mumbai)]
                                              Raw file + Structured record
                                                     │
                               ┌─────────────────────┴───────────────────┐
                          [PWA App]                              [Summary Generator]
                       (Caregiver UI)                           RAG over patient records
                                                                         │
                                                              [PDF Summary] ──WhatsApp──► Doctor
                                                                         │
                                                              [Web Portal] ◄── OTP ── Doctor
```

---

## Components

### 1. WhatsApp Bot (Ingestion)
- Receives photos and PDFs from caregiver
- Asks 1–2 clarifying questions (e.g., "Is this a blood report or a prescription?")
- Sends documents to the ingestion pipeline
- Sends WhatsApp notifications for low-confidence extractions
- Sends the shareable PDF summary on request
- **Technology:** WhatsApp Business API (Meta Cloud API)

### 2. Ingestion Pipeline
- **OCR:** Google Cloud Vision or AWS Textract (India region)
- **LLM Extraction:** Structured JSON output via LLM (GPT-4o or Gemini) — extracts patient name, test names, values, units, reference ranges, dates, doctor name
- **LLM-as-Judge:** Second LLM call validates extraction accuracy against raw OCR text; flags low-confidence fields
- **Storage:** Raw file (S3, Mumbai) + structured record (PostgreSQL, RDS Mumbai)

### 3. Data Model
```
Account
  └── PatientProfile (many per account)
        └── Record (many per patient)
              ├── raw_file_url
              ├── record_type (lab_report | prescription | consultation | imaging)
              ├── extracted_fields (JSON)
              ├── confidence_score
              └── manually_verified (bool)
```

### 4. PWA (Caregiver Management UI)
- Patient profile switcher
- Record browser and organiser
- Summary preview and generation trigger
- Correction interface for flagged extractions
- **Technology:** React PWA, hosted on AWS CloudFront

### 5. Summary Generator
- RAG pipeline: retrieves most relevant records from patient history
- Generates one-page structured summary (patient snapshot, conditions, medications, lab trends, visits)
- Lab trends: primary markers + condition-linked markers (configurable)
- Renders as PDF
- **Technology:** LangChain / custom RAG, PDF generation via Puppeteer or WeasyPrint

### 6. Doctor Web Portal
- Time-limited link (expires in 8 hours)
- OTP-gated (sent to caregiver's phone; Phase 2: push-confirm)
- View all records or drill into specific ones referenced in summary
- Read-only access
- **Technology:** Next.js static page, AWS Lambda for OTP

---

## Infrastructure

| Concern | Decision |
|---|---|
| **Cloud provider** | AWS Mumbai (ap-south-1) |
| **File storage** | S3 (encrypted at rest) |
| **Database** | RDS PostgreSQL (Mumbai) |
| **AI processing** | OpenAI / Google Gemini with data processing agreements |
| **CDN** | CloudFront |
| **Compliance** | DPDP Act 2023 — explicit consent, right to erasure, purpose limitation |

---

## Phase Roadmap

| Phase | Features |
|---|---|
| **v1 (MVP)** | WhatsApp bot, AI extraction + judge, PWA, PDF summary, OTP portal |
| **v2** | Camera scan, push-confirm auth, tiered billing, trend graphs |
| **v3** | ABHA integration, medication reminders, pharmacy partnerships |
