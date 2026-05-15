# Project Brief — Kavach

> *Your family's health, protected.*
> Last updated: 2026-05-16
> **Founders:** Kavya (idea) · Mithra (build)
> **Name origin:** Kavach (कवच) means shield/armour in Sanskrit. Shares the "Kav" root with Kavya's name.

---

## Problem Statement

People in the age group 40–65+ in India face significant problems carrying and preserving their medical documents. Missing files and/or dosages result in delayed or incorrect treatment during consultations and emergencies.

## Needs Statements

Indian citizens between the ages 40–65 have large volumes of medical records they need to access repeatedly when:
- Visiting their regular doctor
- Buying medicines
- Consulting a new doctor
- Facing a medical emergency

---

## Users

| Role | Description |
|---|---|
| **Primary user** | Caregiver (25–40) managing records on behalf of a family member |
| **Beneficiary** | Patient (40–65+) receiving care |
| **Consumer** | Doctor — reads the summary, drills into portal if needed |

## Primary Use Case (MVP)

**Routine doctor's visit** — the caregiver organises and shares a clean medical summary with the doctor before or during an appointment.

---

## Core Thesis to Validate

> *A caregiver, introduced to the product by a trusted doctor, will use a WhatsApp bot to organise medical records and proactively share a one-page summary before the next appointment.*

---

## Value Proposition

For the caregiver:
- Stop carrying folders of paper reports to every appointment
- Never lose an important document again
- Walk into every appointment with a complete, organised history ready
- Share the doctor summary in one WhatsApp message

For the doctor:
- Receive a clean, structured one-page summary before or during consultation
- Drill into source documents if needed without requesting physical copies
- Reduce time wasted reconstructing patient history

---

## v1 Scope

### In Scope
- WhatsApp bot ingestion (photo + PDF)
- AI extraction + LLM-as-judge + caregiver correction flow
- Multi-patient profile management (PWA)
- One-page doctor summary PDF (WhatsApp shareable)
- Web portal with OTP access for doctors
- Free tier only (no payments in v1)
- Core auditability and document traceability

### Out of Scope (Later Phases)
- Camera scan ingestion
- ABHA / Ayushman Bharat Digital Mission integration
- Medication reminders
- Trend graphs and visualisations
- Paid plan billing
- Pharmacy partnerships
- Push-confirm auth
- Multilingual rollout beyond scaffold readiness

---

## Business Model (Post-v1)

| Tier | Price | Features |
|---|---|---|
| **Free** | ₹0 | 1 patient profile, 30 doc uploads/month, basic summary |
| **Family** | ₹149/month or ₹999/year | Unlimited patients, unlimited storage, doctor web portal |
| **Premium** | TBD | AI trend analysis, medication reminders, priority extraction |
| **Pharmacy (B2B)** | Referral/affiliate | Activated prescription leads to pharmacy partners |

---

## GTM Wedge

1. Apollo/KIMS/dermatologist doctor network (highest-trust acquisition channel)
2. Caregiver WhatsApp communities (organic seeding)
3. Pharmacy referrals (later phase)

---

## Non-Goals (v1)

- Not a hospital management system
- Not an EMR/EHR
- Not a telemedicine platform
- Not a medication reminder app
- Not a billing or insurance claims product
