import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#0f0f1a", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#7c3aed", marginBottom: "8px" }}>Kavach</h1>
        <p style={{ fontSize: "1.1rem", color: "#a78bfa", marginBottom: "32px" }}>
          कवच — Your family's health, protected.
        </p>
        <p style={{ color: "#94a3b8", marginBottom: "40px", lineHeight: 1.6 }}>
          Organise medical records for your family. Generate a one-page doctor summary.
          Share it securely before every appointment.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth" style={{ background: "#7c3aed", color: "white", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
            Get Started
          </Link>
          <Link href="/portal" style={{ border: "1px solid #7c3aed", color: "#a78bfa", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
            Doctor Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
