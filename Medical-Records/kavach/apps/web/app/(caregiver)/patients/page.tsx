// Patient list page — shows all patients for the authenticated account
// Multi-patient is first-class: never assume a single patient.

export default function PatientsPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Patients</h1>
        <a href="/patients/new" style={{ background: "#7c3aed", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
          + Add Patient
        </a>
      </div>
      {/* TODO: Fetch and render patient list from API */}
      <div style={{ color: "#94a3b8", textAlign: "center", marginTop: "80px" }}>
        <p>No patients yet. Add your first patient to get started.</p>
      </div>
    </div>
  );
}
