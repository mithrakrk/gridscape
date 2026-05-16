"use client";
/**
 * PatientListClient — interactive patient list with inline Add Patient form.
 * Receives initial patients from Server Component (no loading flash).
 * Manages local state for optimistic UI after create/delete.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type Patient = {
  id: string;
  name: string;
  dateOfBirth: string | null;
  age: number | null;
  bloodGroup: string | null;
  allergies: string[];
  recordCount: number;
};

type Props = { initialPatients: Patient[] };

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

export default function PatientListClient({ initialPatients }: Props) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);

  function resetForm() {
    setName(""); setDob(""); setBloodGroup(""); setAllergyInput(""); setAllergies([]);
    setFormError("");
  }

  function addAllergy() {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
    }
    setAllergyInput("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dateOfBirth: dob || null, bloodGroup: bloodGroup || null, allergies }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setFormError(friendlyError(json.error));
        return;
      }
      // Optimistic: add to list and navigate to detail page
      setPatients((prev) => [...prev, json.data]);
      resetForm();
      setShowForm(false);
      router.push(`/patients/${json.data.id}`);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, patientName: string) {
    if (!confirm(`Delete ${patientName}'s profile? This cannot be undone.`)) return;
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Patients</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "4px 0 0" }}>
            {patients.length === 0 ? "No patients yet" : `${patients.length} patient${patients.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          id="add-patient-btn"
          onClick={() => { setShowForm(true); resetForm(); }}
          style={{ background: "#7c3aed", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
        >
          + Add Patient
        </button>
      </div>

      {/* Add Patient Form */}
      {showForm && (
        <div style={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "#e2e8f0" }}>New Patient</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  id="patient-name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Arjun Mehta"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  id="patient-dob-input"
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Blood Group</label>
                <select
                  id="patient-bloodgroup-select"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">— Select —</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Known Allergies</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id="patient-allergy-input"
                    type="text"
                    value={allergyInput}
                    onChange={e => setAllergyInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAllergy(); } }}
                    placeholder="e.g. Penicillin"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button type="button" onClick={addAllergy} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: "6px", padding: "0 12px", cursor: "pointer" }}>+</button>
                </div>
                {allergies.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {allergies.map(a => (
                      <span key={a} style={{ background: "#3b1f6e", color: "#c4b5fd", padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        {a}
                        <button type="button" onClick={() => setAllergies(allergies.filter(x => x !== a))} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4b5fd", padding: 0, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formError && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{formError}</p>}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                id="create-patient-submit-btn"
                type="submit"
                disabled={submitting || !name.trim()}
                style={{ background: "#7c3aed", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: submitting || !name.trim() ? 0.6 : 1 }}
              >
                {submitting ? "Saving…" : "Save Patient"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{ background: "none", color: "#64748b", border: "1px solid #334155", padding: "12px 24px", borderRadius: "8px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient List */}
      {patients.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>No patients yet.</p>
          <p style={{ fontSize: "0.875rem" }}>Add your first family member to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Patient Card ──────────────────────────────────────────────────────────────

function PatientCard({ patient: p, onDelete }: { patient: Patient; onDelete: (id: string, name: string) => void }) {
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e293b")}
    >
      <a href={`/patients/${p.id}`} style={{ textDecoration: "none", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#f1f5f9", margin: 0, fontSize: "1rem" }}>{p.name}</p>
            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "3px 0 0" }}>
              {[p.age !== null ? `${p.age} yrs` : null, p.bloodGroup].filter(Boolean).join(" · ")}
              {p.allergies.length > 0 ? ` · ${p.allergies.length} allerg${p.allergies.length > 1 ? "ies" : "y"}` : ""}
            </p>
          </div>
        </div>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ background: "#0f172a", color: "#7c3aed", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>
          {p.recordCount} record{p.recordCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => onDelete(p.id, p.name)}
          style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem", transition: "color 0.2s" }}
          title="Delete patient"
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px", fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px",
  padding: "10px 12px", color: "#f1f5f9", outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
};

function friendlyError(code: string): string {
  switch (code) {
    case "MISSING_NAME": return "Patient name is required.";
    case "INVALID_DOB": return "Please enter a valid date of birth.";
    case "UNAUTHENTICATED": return "Session expired. Please log in again.";
    default: return "Something went wrong. Please try again.";
  }
}
