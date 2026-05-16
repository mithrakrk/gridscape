// SYNTHETIC TEST DATA — NOT REAL PHI
// Fictional medical record extractions for testing only.

export const SYNTHETIC_LAB_REPORT = {
  id: "cjtest001record001",
  patientId: "cjtest001patient001",
  rawFileUrl: "s3://kavach-test-bucket/synthetic/lab-report-001.jpg",
  rawFileKey: "synthetic/lab-report-001.jpg",
  recordType: "LAB_REPORT",
  recordDate: "2024-03-15",
  status: "VERIFIED",
  confidenceScore: 0.92,
  judgeVerified: true,
  manuallyVerified: false,
  extractedFields: [
    { fieldName: "hba1c", rawValue: "7.2%", normalizedValue: "7.2", unit: "%", referenceRange: "4.0-5.6%", confidence: 0.95, isLowConfidence: false, correctedValue: null },
    { fieldName: "fasting_glucose", rawValue: "118 mg/dL", normalizedValue: "118", unit: "mg/dL", referenceRange: "70-100 mg/dL", confidence: 0.93, isLowConfidence: false, correctedValue: null },
    { fieldName: "doctor_name", rawValue: "Dr. Ravi Kumar (Synthetic)", normalizedValue: "Dr. Ravi Kumar (Synthetic)", unit: null, referenceRange: null, confidence: 0.90, isLowConfidence: false, correctedValue: null },
  ],
};

export const SYNTHETIC_PRESCRIPTION = {
  id: "cjtest002record002",
  patientId: "cjtest001patient001",
  rawFileUrl: "s3://kavach-test-bucket/synthetic/prescription-001.jpg",
  rawFileKey: "synthetic/prescription-001.jpg",
  recordType: "PRESCRIPTION",
  recordDate: "2024-03-15",
  status: "LOW_CONFIDENCE",
  confidenceScore: 0.65,
  judgeVerified: false,
  manuallyVerified: false,
  extractedFields: [
    { fieldName: "medication_name", rawValue: "Metformin", normalizedValue: "Metformin", unit: null, referenceRange: null, confidence: 0.90, isLowConfidence: false, correctedValue: null },
    { fieldName: "dosage", rawValue: "250m", normalizedValue: null, unit: null, referenceRange: null, confidence: 0.42, isLowConfidence: true, correctedValue: null },
    { fieldName: "frequency", rawValue: "Twice daily", normalizedValue: "Twice daily", unit: null, referenceRange: null, confidence: 0.88, isLowConfidence: false, correctedValue: null },
  ],
};

export const SYNTHETIC_JUDGE_RESULT = {
  overallConfidence: 0.65,
  fieldJudgments: [
    { fieldName: "medication_name", extractedValue: "Metformin", foundInOcr: true, confidence: 0.90, concern: null },
    { fieldName: "dosage", extractedValue: "250m", foundInOcr: false, confidence: 0.42, concern: "Dosage not clearly legible — OCR may have misread 250mg as 250m" },
  ],
};
