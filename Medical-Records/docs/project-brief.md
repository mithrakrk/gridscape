# Kavach — Project Brief

> *Your family's health, protected.*
> Generated from grill-me session — 2026-05-16
>
> **Founders:** Kavya (idea) · Mithra (build)
> **Name origin:** Kavach (कवच) means shield/armour in Sanskrit. Shares the "Kav" root with Kavya's name.

---

## Problem Statement

People in the age group 40–65+ in India face significant problems carrying and preserving their medical documents. Missing files and/or dosages result in delayed or incorrect treatment during consultations and emergencies.

## Needs Statements

Indian citizens between the ages 40–65 have large volumes of medical records that they need to repeatedly access when:
- Visiting their regular doctor
- Buying medicines
- Consulting a new doctor
- Facing a medical emergency

---

## Product Definition

### Users
| Role | Description |
|---|---|
| **Primary user** | Caregiver (25–40 years old) managing records on behalf of a family member |
| **Beneficiary** | Patient (40–65 years old) receiving care |

### Primary Use Case (MVP)
**Routine doctor's visit** — the caregiver organises and shares a clean medical summary with the doctor before/during an appointment.

---

## Core Decisions

| Decision | Resolution |
|---|---|
| **Primary use case** | Routine doctor's visit |
| **Doctor handoff** | WhatsApp-shared one-page PDF summary + web portal for drill-down into specific or all reports |
| **Portal access control** | OTP sent to caregiver's phone (Phase 2: push-confirm button like Google Auth) |
| **Record ingestion** | WhatsApp bot (primary); camera scan (Phase 2) |
| **AI architecture** | OCR → LLM extraction → LLM-as-judge (accuracy validation) → RAG for summary generation |
| **Human-in-the-loop** | WhatsApp notification for low-confidence extractions; caregiver can type the answer or re-upload a clearer photo |
| **Data model** | `Account → [Patient Profiles] → [Records]` (multi-patient from day one) |
| **Platform** | PWA for caregiver management + WhatsApp for ingestion and sharing |
| **Data & compliance** | AWS Mumbai (ap-south-1), DPDP Act 2023 compliant, explicit consent, right to erasure |
| **Business model** | Freemium + Family + Premium tiers; pharmacy referral revenue (later phase) |
| **GTM wedge** | Apollo/KIMS/dermatologist doctor network → caregiver WhatsApp communities → pharmacy referrals |

---

## One-Page Doctor Summary — Contents

| # | Section | Details |
|---|---|---|
| 1 | **Patient snapshot** | Name, age, blood group, weight, known allergies |
| 2 | **Active conditions** | Diagnosis name + date |
| 3 | **Current medications** | Drug, dosage, frequency, prescribing doctor |
| 4 | **Lab trends** | Primary markers + condition-linked markers (e.g., diabetic → HbA1c, fasting glucose, eGFR) with ↑↓ indicators. Configurable based on HCP research. |
| 5 | **Recent visits** | Last 3 consultations — doctor, date, diagnosis |
| 6 | **Upcoming/pending** | Next review dates, pending tests |
| 7 | **Portal access** | QR code + time-limited link for full record drill-down |

---

## Business Model

| Tier | Price | Features |
|---|---|---|
| **Free** | ₹0 | 1 patient profile, 30 doc uploads/month, basic summary |
| **Family** | ₹149/month or ₹999/year | Unlimited patients, unlimited storage, doctor web portal |
| **Premium** | TBD | AI trend analysis, medication reminders, priority extraction |
| **Pharmacy (B2B)** | Referral/affiliate | Activated prescription leads sent to pharmacy partners |

---

## v1 Scope

### ✅ In Scope
- WhatsApp bot ingestion (photo + PDF)
- AI extraction + LLM-as-judge + caregiver correction flow
- Multi-patient profile management (PWA)
- One-page doctor summary PDF (WhatsApp shareable)
- Web portal with OTP access for doctors
- Free tier only (no payments in v1)

### ❌ Out of Scope (Later Phases)
- Camera scan ingestion
- ABHA / Ayushman Bharat Digital Mission integration
- Medication reminders
- Trend graphs and visualisations
- Paid plan billing
- Pharmacy partnerships
- Push-confirm auth

---

## Core Thesis to Validate

> *A caregiver, introduced to the product by a trusted doctor, will use a WhatsApp bot to organise medical records and proactively share a one-page summary before the next appointment.*
