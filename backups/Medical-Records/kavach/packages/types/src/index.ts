// Kavach — Shared TypeScript Types
// All types follow the Account -> PatientProfile -> Record hierarchy.

export type RecordType = "LAB_REPORT" | "PRESCRIPTION" | "CONSULTATION" | "IMAGING" | "DISCHARGE" | "OTHER";
export type RecordStatus = "PENDING" | "PROCESSING" | "EXTRACTION_FAILED" | "LOW_CONFIDENCE" | "VERIFIED";

export interface PatientSummary {
  id: string;
  name: string;
  dateOfBirth: string | null;
  age: number | null;
  bloodGroup: string | null;
  weightKg: number | null;
  allergies: string[];
}

export interface RecordSummary {
  id: string;
  recordType: RecordType;
  recordDate: string | null;
  status: RecordStatus;
  confidenceScore: number | null;
  judgeVerified: boolean;
  manuallyVerified: boolean;
}

export interface ExtractedFieldDto {
  id: string;
  fieldName: string;
  rawValue: string;
  normalizedValue: string | null;
  unit: string | null;
  referenceRange: string | null;
  confidence: number;
  isLowConfidence: boolean;
  correctedValue: string | null;
}

// Doctor Summary — 7-section structure
export interface DoctorSummary {
  generatedAt: string;
  patientSnapshot: {
    name: string;
    age: number | null;
    bloodGroup: string | null;
    weightKg: number | null;
    allergies: string[];
  };
  activeConditions: Array<{
    diagnosis: string;
    diagnosedDate: string | null;
  }>;
  currentMedications: Array<{
    drug: string;
    dosage: string;
    frequency: string;
    prescribingDoctor: string | null;
  }>;
  labTrends: Array<{
    markerName: string;
    unit: string | null;
    latestValue: string | null;
    latestDate: string | null;
    previousValue: string | null;
    previousDate: string | null;
    referenceRange: string | null;
    trend: "UP" | "DOWN" | "STABLE" | "UNKNOWN";
    isProvisional: boolean; // PROVISIONAL until HCP-validated
  }>;
  recentVisits: Array<{
    doctorName: string | null;
    visitDate: string | null;
    diagnosis: string | null;
  }>;
  upcomingPending: {
    nextReviewDates: Array<{ description: string; date: string | null }>;
    pendingTests: string[];
  };
  portalAccess: {
    portalLink: string;
    expiresAt: string;
  };
}

// OCR and Extraction types
export interface OcrResult {
  rawText: string;
  confidence: number;
  blocks: Array<{ text: string; confidence: number }>;
}

export interface ExtractionResult {
  patientName?: { value: string; confidence: number };
  recordDate?: { value: string; confidence: number };
  doctorName?: { value: string; confidence: number };
  recordType: RecordType;
  fields: ExtractedFieldDto[];
  overallConfidence: number;
}

export interface JudgeResult {
  overallConfidence: number;
  fieldJudgments: Array<{
    fieldName: string;
    extractedValue: string;
    foundInOcr: boolean;
    confidence: number;
    concern: string | null;
  }>;
}

// API response envelope
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
