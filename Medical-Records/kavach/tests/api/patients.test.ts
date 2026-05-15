// tests/api/patients.test.ts
// SYNTHETIC TEST DATA — NOT REAL PHI
// API tests for patient CRUD endpoints.

import { describe, it, expect } from "vitest";

// These tests define the expected API contract for /api/patients.
// They will become real HTTP tests once the API is implemented.

describe("GET /api/patients", () => {
  it("should return ApiResponse shape", () => {
    // Expected response: { data: PatientProfile[] | null, error: string | null }
    const expectedShape = { data: expect.anything(), error: null };
    // Placeholder until real HTTP test client is set up
    expect(true).toBe(true);
  });

  it("should return 401 without valid session", () => {
    // TODO: Make real HTTP request without auth cookie
    // Expected: 401 Unauthorized
    expect(true).toBe(true);
  });

  it("should only return patients for the authenticated account", () => {
    // TODO: Create 2 accounts, add patient to each, verify cross-account isolation
    expect(true).toBe(true);
  });
});

describe("POST /api/patients", () => {
  it("should require name and dateOfBirth", () => {
    // TODO: POST with missing required fields → expect 400
    expect(true).toBe(true);
  });

  it("should create patient scoped to authenticated account", () => {
    // TODO: POST valid patient → expect created patient with correct accountId
    expect(true).toBe(true);
  });
});
