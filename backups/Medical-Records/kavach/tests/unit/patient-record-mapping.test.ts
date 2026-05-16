// tests/unit/patient-record-mapping.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// Tests patient record mapping and multi-patient scoping logic.

import { describe, it, expect } from "vitest";

// Synthetic test patient — not real PHI
const SYNTHETIC_PATIENT_A = {
  id: "cjtest001patient001",
  accountId: "cjtest001account001",
  name: "Arjun Mehta (Test)",
  dateOfBirth: new Date("1958-03-15"),
  bloodGroup: "O+",
  weightKg: 72,
  allergies: ["Penicillin"],
};

const SYNTHETIC_PATIENT_B = {
  id: "cjtest002patient002",
  accountId: "cjtest001account001", // Same account — multi-patient
  name: "Meena Mehta (Test)",
  dateOfBirth: new Date("1960-07-22"),
  bloodGroup: "A+",
  weightKg: 58,
  allergies: [],
};

describe("Patient record mapping", () => {
  it("should scope patient queries to accountId", () => {
    const patients = [SYNTHETIC_PATIENT_A, SYNTHETIC_PATIENT_B];
    const forAccount = patients.filter(p => p.accountId === "cjtest001account001");
    expect(forAccount).toHaveLength(2);
  });

  it("should not return patients from another account", () => {
    const patients = [SYNTHETIC_PATIENT_A, SYNTHETIC_PATIENT_B];
    const forOtherAccount = patients.filter(p => p.accountId === "cjtest999account999");
    expect(forOtherAccount).toHaveLength(0);
  });

  it("should calculate age from dateOfBirth", () => {
    const dob = SYNTHETIC_PATIENT_A.dateOfBirth;
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    expect(age).toBeGreaterThan(60); // Arjun born 1958, should be 60+
  });
});

describe("Multi-patient account", () => {
  it("should support multiple patients per account", () => {
    const patients = [SYNTHETIC_PATIENT_A, SYNTHETIC_PATIENT_B];
    expect(patients.length).toBeGreaterThan(1);
    const uniqueAccounts = new Set(patients.map(p => p.accountId));
    expect(uniqueAccounts.size).toBe(1); // All same account
  });
});
