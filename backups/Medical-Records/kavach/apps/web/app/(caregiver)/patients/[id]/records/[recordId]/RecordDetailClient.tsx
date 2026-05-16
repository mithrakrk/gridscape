"use client";
/**
 * RecordDetailClient — record detail with inline field correction.
 * Low-confidence fields are shown first with inline edit controls.
 * Corrections call PATCH /api/records/[id]/fields/[fieldId].
 * On all fields resolved, shows a "Record verified" banner.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExtractedField = {
  id: string;
  fieldName: string;
  rawValue: string;
  normalizedValue: string | null;
  unit: string | null;
  referenceRange: string | null;
  confidence: number;
  isLowConfidence: boolean;
  correctedValue: string | null;
  correctedAt: string | null;
};

type Record = {
  id: string;
  patientId: string;
  patientName: string;
  recordType: string;
  recordDate: string | null;
  status: string;
  confidenceScore: number | null;
  judgeVerified: boolean;
  manuallyVerified: boolean;
  correctionNote: string | null;
  rawFileUrl: string;
  createdAt: string;
  extractedFields: ExtractedField[];
};

const RECORD_TYPE_LABELS: Record<string, string> = {
  LAB_REPORT: "Lab Report", PRESCRIPTION: "Prescription",
  CONSULTATION: "Consultation", IMAGING: "Imaging",
  DISCHARGE: "Discharge", OTHER: "Other",
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  VERIFIED:           { bg: "#14532d", color: "#86efac", label: "Verified" },
  LOW_CONFIDENCE:     { bg: "#78350f", color: "#fcd34d", label: "Low Confidence" },
  PENDING:            { bg: "#1e293b", color: "#94a3b8", label: "Pending" },
  PROCESSING:         { bg: "#1e3a5f", color: "#93c5fd", label: "Processing" },
  EXTRACTION_FAILED:  { bg: "#450a0a", color: "#fca5a5", label: "Extraction Failed" },
};

export default function RecordDetailClient({ record }: { record: Record }) {
  const router = useRouter();
  const [fields, setFields] = useState<ExtractedField[]>(record.extractedFields);
  const [status, setStatus] = useState(record.status);
  const [manuallyVerified, setManuallyVerified] = useState(record.manuallyVerified);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");

  const pendingCorrections = fields.filter((f) => f.isLowConfidence && !f.correctedValue).length;

  function startEdit(field: ExtractedField) {
    setEditingFieldId(field.id);
    setEditValue(field.correctedValue ?? field.normalizedValue ?? field.rawValue);
    setFieldError("");
  }

  async function saveCorrection(fieldId: string) {
    if (!editValue.trim()) { setFieldError("Value cannot be empty."); return; }
    setSavingFieldId(fieldId);
    setFieldError("");

    try {
      const res = await fetch(`/api/records/${record.id}/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctedValue: editValue.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setFieldError("Save failed. Please try again."); return; }

      // Update local state
      const now = new Date().toISOString();
      setFields((prev) =>
        prev.map((f) => f.id === fieldId ? { ...f, correctedValue: editValue.trim(), correctedAt: now } : f)
      );

      if (json.data.recordPromotedToVerified) {
        setStatus("VERIFIED");
        setManuallyVerified(true);
      }

      setEditingFieldId(null);
    } catch {
      setFieldError("Network error. Please try again.");
    } finally {
      setSavingFieldId(null);
    }
  }

  const s = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ marginBottom: "20px", fontSize: "0.875rem", color: "#475569" }}>
        <a href="/patients" style={{ color: "#7c3aed", textDecoration: "none" }}>Patients</a>
        <span style={{ margin: "0 8px" }}>›</span>
        <a href={`/patients/${record.patientId}`} style={{ color: "#7c3aed", textDecoration: "none" }}>{record.patientName}</a>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>{RECORD_TYPE_LABELS[record.recordType] ?? record.recordType}</span>
      </nav>

      {/* Record Header Card */}
      <div style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>
              {RECORD_TYPE_LABELS[record.recordType] ?? record.recordType}
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
              {record.recordDate ?? "Date unknown"} · {record.patientName}
            </p>
          </div>
          <span style={{ background: s.bg, color: s.color, padding: "5px 14px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0 }}>
            {s.label}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
          <InfoField label="Confidence" value={record.confidenceScore !== null ? `${Math.round(record.confidenceScore * 100)}%` : "—"} />
          <InfoField label="AI Verified" value={record.judgeVerified ? "Yes" : "No"} />
          <InfoField label="Manually Verified" value={manuallyVerified ? "Yes ✓" : "No"} highlight={manuallyVerified} />
          <InfoField label="Added" value={new Date(record.createdAt).toLocaleDateString("en-IN")} />
        </div>

        {/* All-clear banner */}
        {status === "VERIFIED" && manuallyVerified && (
          <div style={{ marginTop: "16px", background: "#052e16", border: "1px solid #166534", borderRadius: "8px", padding: "10px 14px", color: "#86efac", fontSize: "0.85rem" }}>
            ✓ All fields verified — this record will be included in the next summary.
          </div>
        )}

        {/* Pending corrections banner */}
        {pendingCorrections > 0 && (
          <div style={{ marginTop: "16px", background: "#431407", border: "1px solid #92400e", borderRadius: "8px", padding: "10px 14px", color: "#fcd34d", fontSize: "0.85rem" }}>
            ⚠ {pendingCorrections} field{pendingCorrections > 1 ? "s" : ""} need{pendingCorrections === 1 ? "s" : ""} your review. Correct them below to verify this record.
          </div>
        )}
      </div>

      {/* Extracted Fields */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "14px" }}>
          Extracted Fields
          <span style={{ color: "#475569", fontWeight: 400, fontSize: "0.875rem", marginLeft: "8px" }}>({fields.length})</span>
        </h2>

        {fields.length === 0 ? (
          <div style={{ background: "#1a1a2e", border: "1px dashed #1e293b", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#475569" }}>
            No extracted fields — this record was not processed by AI yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {fields.map((f) => (
              <FieldRow
                key={f.id}
                field={f}
                isEditing={editingFieldId === f.id}
                editValue={editValue}
                saving={savingFieldId === f.id}
                error={editingFieldId === f.id ? fieldError : ""}
                onEdit={startEdit}
                onEditValueChange={setEditValue}
                onSave={saveCorrection}
                onCancel={() => { setEditingFieldId(null); setFieldError(""); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────────────────────

function FieldRow({
  field: f,
  isEditing,
  editValue,
  saving,
  error,
  onEdit,
  onEditValueChange,
  onSave,
  onCancel,
}: {
  field: ExtractedField;
  isEditing: boolean;
  editValue: string;
  saving: boolean;
  error: string;
  onEdit: (f: ExtractedField) => void;
  onEditValueChange: (v: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
}) {
  const isCorrected = f.correctedValue !== null;
  const displayValue = isCorrected ? f.correctedValue! : (f.normalizedValue ?? f.rawValue);

  const borderColor = f.isLowConfidence && !isCorrected ? "#92400e" : isCorrected ? "#166534" : "#1e293b";
  const bgColor = f.isLowConfidence && !isCorrected ? "#1c1209" : isCorrected ? "#071e11" : "#1a1a2e";

  return (
    <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: "10px", padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <p style={{ fontWeight: 600, color: "#e2e8f0", margin: 0, fontSize: "0.9rem" }}>{f.fieldName}</p>
            {f.isLowConfidence && !isCorrected && (
              <span style={{ background: "#78350f", color: "#fcd34d", padding: "1px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>LOW CONFIDENCE</span>
            )}
            {isCorrected && (
              <span style={{ background: "#14532d", color: "#86efac", padding: "1px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>CORRECTED</span>
            )}
          </div>

          {isEditing ? (
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  id={`field-edit-${f.id}`}
                  type="text"
                  value={editValue}
                  onChange={e => onEditValueChange(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") onSave(f.id); if (e.key === "Escape") onCancel(); }}
                  autoFocus
                  style={{ flex: 1, background: "#0f0f1a", border: "1px solid #7c3aed", borderRadius: "6px", padding: "8px 12px", color: "#f1f5f9", outline: "none", fontSize: "0.9rem" }}
                />
                {f.unit && <span style={{ color: "#64748b", fontSize: "0.85rem", flexShrink: 0 }}>{f.unit}</span>}
              </div>
              {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "6px 0 0" }}>{error}</p>}
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  id={`save-field-${f.id}`}
                  onClick={() => onSave(f.id)}
                  disabled={saving}
                  style={{ background: "#7c3aed", color: "white", border: "none", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={onCancel} style={{ background: "none", color: "#64748b", border: "1px solid #334155", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "#f1f5f9", margin: "0 0 4px", fontSize: "0.95rem" }}>
                {displayValue}
                {f.unit && <span style={{ color: "#64748b", marginLeft: "4px", fontSize: "0.85rem" }}>{f.unit}</span>}
              </p>
              {isCorrected && f.rawValue !== f.correctedValue && (
                <p style={{ color: "#475569", fontSize: "0.78rem", margin: "2px 0 0" }}>
                  Original: {f.rawValue}
                </p>
              )}
              {f.referenceRange && (
                <p style={{ color: "#475569", fontSize: "0.78rem", margin: "2px 0 0" }}>
                  Ref: {f.referenceRange}
                </p>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
            <span style={{ color: "#475569", fontSize: "0.75rem" }}>
              {Math.round(f.confidence * 100)}%
            </span>
            <button
              id={`edit-field-${f.id}`}
              onClick={() => onEdit(f)}
              style={{ background: "#1e293b", color: "#94a3b8", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem" }}
            >
              {isCorrected ? "Re-edit" : "Correct"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function InfoField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ color: "#475569", fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>{label}</p>
      <p style={{ color: highlight ? "#86efac" : "#e2e8f0", fontSize: "0.9rem", margin: 0 }}>{value}</p>
    </div>
  );
}
