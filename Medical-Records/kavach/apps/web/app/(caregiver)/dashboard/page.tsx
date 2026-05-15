// Dashboard — Caregiver landing page after login
// Shows patient switcher and record counts

export default function DashboardPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: "#94a3b8" }}>Manage your family's health records</p>
      </header>

      {/* Patient Switcher — multi-patient is first-class */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>Patients</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* TODO: Render real patients from API */}
          <PatientCard name="Add your first patient" empty />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <ActionCard label="Add Patient" href="/patients/new" />
          <ActionCard label="View Records" href="/records" />
          <ActionCard label="Generate Summary" href="/summaries" />
        </div>
      </section>
    </div>
  );
}

function PatientCard({ name, empty }: { name: string; empty?: boolean }) {
  return (
    <div style={{
      border: empty ? "2px dashed #334155" : "1px solid #334155",
      borderRadius: "8px",
      padding: "16px 20px",
      minWidth: "160px",
      background: "#1a1a2e",
      cursor: "pointer",
    }}>
      <p style={{ fontWeight: 600 }}>{name}</p>
    </div>
  );
}

function ActionCard({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} style={{
      background: "#7c3aed",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: "0.9rem",
    }}>
      {label}
    </a>
  );
}
