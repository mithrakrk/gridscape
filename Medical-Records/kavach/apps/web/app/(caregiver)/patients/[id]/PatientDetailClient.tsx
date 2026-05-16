"use client";
/**
 * PatientDetailClient — patient detail view with records list.
 * Shows patient snapshot, record list with status badges,
 * and inline edit for patient metadata.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type Record = {
  id: string;
  recordType: string;
  recordDate: string | null;
  status: string;
  confidenceScore: number | null;
  judgeVerified: boolean;
  manuallyVerified: boolean;
};

type Patient = {
  id: string;
  name: string;
  dateOfBirth: string | null;
  age: number | null;
  bloodGroup: string | null;
  weightKg: number | null;
  allergies: string[];
  records: Record[];
};

export default function PatientDetailClient({ patient }: { patient: Patient }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit form state
  const [eName, setEName] = useState(patient.name);
  const [eDob, setEDob] = useState(patient.dateOfBirth ?? "");
  const [eBloodGroup, setEBloodGroup] = useState(patient.bloodGroup ?? "");
  const [eWeightKg, setEWeightKg] = useState(patient.weightKg !== null ? String(patient.weightKg) : "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eName,
          dateOfBirth: eDob || null,
          bloodGroup: eBloodGroup || null,
          weightKg: eWeightKg ? parseFloat(eWeightKg) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setEditError("Update failed. Please try again.");
        return;
      }
      setEditing(false);
      router.refresh(); // Re-fetch server data
    } catch {
      setEditError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${patient.name}'s profile and all records? This cannot be undone.`)) return;
    await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
    router.replace("/patients");
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ marginBottom: "20px" }}>
        <a href="/patients" style={{ color: "#7c3aed", textDecoration: "none", fontSize: "0.875rem" }}>← Patients</a>
      </nav>

      {/* Patient Card */}
      <div style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "14px", padding: "28px", marginBottom: "28px" }}>
        {!editing ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.3rem" }}>
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{patient.name}</h1>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0" }}>
                    {[patient.age !== null ? `${patient.age} years old` : null, patient.bloodGroup].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  id="edit-patient-btn"
                  onClick={() => setEditing(true)}
                  style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Edit
                </button>
                <button
                  id="delete-patient-btn"
                  onClick={handleDelete}
                  style={{ background: "none", color: "#475569", border: "1px solid #334155", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", transition: "color 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#334155"; }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
              <InfoField label="Date of Birth" value={patient.dateOfBirth ?? "—"} />
              <InfoField label="Blood Group" value={patient.bloodGroup ?? "—"} />
              <InfoField label="Weight" value={patient.weightKg !== null ? `${patient.weightKg} kg` : "—"} />
              <div>
                <p style={labelStyle}>Allergies</p>
                {patient.allergies.length === 0 ? (
                  <p style={valueStyle}>—</p>
                ) : (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    {patient.allergies.map(a => (
                      <span key={a} style={{ background: "#3b1f6e", color: "#c4b5fd", padding: "2px 10px", borderRadius: "999px", fontSize: "0.78rem" }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // Edit form
          <form onSubmit={handleSave}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "20px" }}>Edit Patient</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={formLabelStyle}>Full Name *</label>
                <input type="text" value={eName} onChange={e => setEName(e.target.value)} required style={formInputStyle} />
              </div>
              <div>
                <label style={formLabelStyle}>Date of Birth</label>
                <input type="date" value={eDob} onChange={e => setEDob(e.target.value)} style={formInputStyle} />
              </div>
              <div>
                <label style={formLabelStyle}>Blood Group</label>
                <select value={eBloodGroup} onChange={e => setEBloodGroup(e.target.value)} style={{ ...formInputStyle, cursor: "pointer" }}>
                  <option value="">—</option>
                  {["A+","A−","B+","B−","AB+","AB−","O+","O−"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={formLabelStyle}>Weight (kg)</label>
                <input type="number" step="0.1" value={eWeightKg} onChange={e => setEWeightKg(e.target.value)} style={formInputStyle} placeholder="e.g. 68.5" />
              </div>
            </div>
            {editError && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{editError}</p>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" disabled={saving} style={{ background: "#7c3aed", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={{ background: "none", color: "#64748b", border: "1px solid #334155", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Records Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
            Records <span style={{ color: "#475569", fontWeight: 400, fontSize: "0.875rem" }}>({patient.records.length})</span>
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#475569" }}>Upload via WhatsApp (coming soon)</span>
        </div>

        {patient.records.length === 0 ? (
          <div style={{ background: "#1a1a2e", border: "1px dashed #1e293b", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#475569" }}>
            <p style={{ fontSize: "1rem", marginBottom: "8px" }}>No records yet</p>
            <p style={{ fontSize: "0.8rem" }}>Send a medical document to the Kavach WhatsApp bot to add records</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {patient.records.map((r) => <RecordRow key={r.id} record={r} patientId={patient.id} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value}</p>
    </div>
  );
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  LAB_REPORT: "Lab Report", PRESCRIPTION: "Prescription",
  CONSULTATION: "Consultation", IMAGING: "Imaging",
  DISCHARGE: "Discharge", OTHER: "Other",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  VERIFIED:           { bg: "#14532d", color: "#86efac" },
  LOW_CONFIDENCE:     { bg: "#78350f", color: "#fcd34d" },
  PENDING:            { bg: "#1e293b", color: "#94a3b8" },
  PROCESSING:         { bg: "#1e3a5f", color: "#93c5fd" },
  EXTRACTION_FAILED:  { bg: "#450a0a", color: "#fca5a5" },
};

function RecordRow({ record: r, patientId }: { record: Record; patientId: string }) {
  const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
  return (
    <a href={`/patients/${patientId}/records/${r.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c3aed")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e293b")}
      >
        <div>
          <p style={{ fontWeight: 600, color: "#e2e8f0", margin: 0, fontSize: "0.95rem" }}>
            {RECORD_TYPE_LABELS[r.recordType] ?? r.recordType}
          </p>
          <p style={{ color: "#475569", fontSize: "0.8rem", margin: "3px 0 0" }}>
            {r.recordDate ?? "Date unknown"}
            {r.confidenceScore !== null ? ` · ${Math.round(r.confidenceScore * 100)}% confidence` : ""}
            {r.manuallyVerified ? " · ✓ manually verified" : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, flexShrink: 0 }}>
            {r.status.replace("_", " ")}
          </span>
          <span style={{ color: "#475569", fontSize: "0.85rem" }}>→</span>
        </div>
      </div>
    </a>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" };
const valueStyle: React.CSSProperties = { color: "#e2e8f0", fontSize: "0.95rem", margin: 0 };
const formLabelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px", fontWeight: 500 };
const formInputStyle: React.CSSProperties = { width: "100%", background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "10px 12px", color: "#f1f5f9", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" };
