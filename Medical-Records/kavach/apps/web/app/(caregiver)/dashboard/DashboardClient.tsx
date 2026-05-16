"use client";
/**
 * DashboardClient — renders patient switcher cards and recent records feed.
 */

type Patient = {
  id: string;
  name: string;
  age: number | null;
  bloodGroup: string | null;
  recordCount: number;
};

type RecentRecord = {
  id: string;
  recordType: string;
  recordDate: string | null;
  status: string;
  patientId: string;
  patientName: string;
};

type Props = { patients: Patient[]; recentRecords: RecentRecord[] };

const RECORD_TYPE_LABELS: Record<string, string> = {
  LAB_REPORT: "Lab Report", PRESCRIPTION: "Prescription",
  CONSULTATION: "Consultation", IMAGING: "Imaging",
  DISCHARGE: "Discharge", OTHER: "Other",
};

const STATUS_DOT: Record<string, string> = {
  VERIFIED: "#22c55e",
  LOW_CONFIDENCE: "#f59e0b",
  PENDING: "#64748b",
  PROCESSING: "#3b82f6",
  EXTRACTION_FAILED: "#ef4444",
};

export default function DashboardClient({ patients, recentRecords }: Props) {
  return (
    <div style={{ padding: "24px", maxWidth: "860px", margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "6px 0 0" }}>
          Your family's health records at a glance
        </p>
      </header>

      {/* Patient Switcher */}
      <section style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Patients</h2>
          <a href="/patients" style={{ fontSize: "0.8rem", color: "#7c3aed", textDecoration: "none" }}>View all →</a>
        </div>

        {patients.length === 0 ? (
          <a href="/patients" style={{ textDecoration: "none" }}>
            <div style={{ border: "2px dashed #1e293b", borderRadius: "12px", padding: "28px", textAlign: "center", color: "#475569", cursor: "pointer" }}>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>+ Add your first patient</p>
            </div>
          </a>
        ) : (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {patients.map((p) => (
              <a key={p.id} href={`/patients/${p.id}`} style={{ textDecoration: "none", flex: "1 1 180px", minWidth: "180px", maxWidth: "240px" }}>
                <div
                  style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "12px", padding: "18px 20px", cursor: "pointer", transition: "border-color 0.2s, transform 0.1s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#7c3aed"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e293b"; }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: "10px" }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 600, color: "#f1f5f9", margin: "0 0 4px", fontSize: "0.95rem" }}>{p.name}</p>
                  <p style={{ color: "#64748b", fontSize: "0.78rem", margin: 0 }}>
                    {[p.age !== null ? `${p.age} yrs` : null, p.bloodGroup].filter(Boolean).join(" · ")}
                  </p>
                  <div style={{ marginTop: "12px", background: "#0f172a", borderRadius: "6px", padding: "4px 10px", display: "inline-block" }}>
                    <span style={{ color: "#7c3aed", fontSize: "0.78rem", fontWeight: 600 }}>
                      {p.recordCount} record{p.recordCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </a>
            ))}
            <a href="/patients" style={{ textDecoration: "none", flex: "1 1 180px", minWidth: "180px", maxWidth: "240px" }}>
              <div style={{ border: "2px dashed #1e293b", borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", height: "100%", boxSizing: "border-box", minHeight: "120px" }}>
                <span style={{ fontSize: "0.875rem" }}>+ Add Patient</span>
              </div>
            </a>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>Recent Records</h2>
        {recentRecords.length === 0 ? (
          <div style={{ background: "#1a1a2e", border: "1px dashed #1e293b", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#475569" }}>
            <p style={{ margin: 0 }}>No records yet. Send a medical document to your Kavach WhatsApp number to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentRecords.map((r) => (
              <a key={r.id} href={`/patients/${r.patientId}/records/${r.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#1a1a2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#7c3aed"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e293b"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_DOT[r.status] ?? "#64748b", flexShrink: 0, display: "inline-block" }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>
                        {RECORD_TYPE_LABELS[r.recordType] ?? r.recordType}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.78rem" }}>
                        {r.patientName} · {r.recordDate ?? "Date unknown"}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: "#475569", fontSize: "0.8rem" }}>→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <ActionCard label="Manage Patients" href="/patients" />
          <ActionCard label="Generate Summary" href="/summaries" muted />
        </div>
      </section>
    </div>
  );
}

function ActionCard({ label, href, muted }: { label: string; href: string; muted?: boolean }) {
  return (
    <a href={href} style={{
      background: muted ? "#1a1a2e" : "#7c3aed",
      color: muted ? "#64748b" : "white",
      border: muted ? "1px solid #1e293b" : "none",
      padding: "12px 20px",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
    }}>
      {label}
    </a>
  );
}
