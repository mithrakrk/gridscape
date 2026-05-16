// Doctor Portal — OTP-gated read-only portal for doctors.
// Doctors access via a time-limited link shared by the caregiver.
// OTP is sent to the caregiver's phone, not the doctor's.

"use client";
import { useState } from "react";

type Props = { params: { token: string } };

export default function PortalPage({ params }: Props) {
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (verified) {
    return <DoctorSummaryView token={params.token} />;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "400px", border: "1px solid #334155" }}>
        <h1 style={{ color: "#7c3aed", fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Kavach Portal</h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "0.9rem" }}>
          A verification code has been sent to the patient's caregiver. Enter the code below to access the medical summary.
        </p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          // TODO: POST /api/portal/verify { token: params.token, otp }
          // On success: setVerified(true)
          // On failure: setError("Incorrect code. X attempts remaining.")
          setLoading(false);
        }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Verification Code</label>
          <input
            type="text" value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="000000" required maxLength={6} inputMode="numeric"
            style={{ width: "100%", background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "white", outline: "none", marginBottom: "8px", letterSpacing: "0.3em", textAlign: "center", fontSize: "1.2rem" }}
          />
          {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", marginTop: "8px" }}>
            {loading ? "Verifying..." : "Access Records"}
          </button>
        </form>
        <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: "24px", textAlign: "center" }}>
          This link expires 8 hours from when it was generated. Read-only access only.
        </p>
      </div>
    </main>
  );
}

function DoctorSummaryView({ token }: { token: string }) {
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#7c3aed", fontSize: "1.2rem", fontWeight: 700 }}>Kavach Medical Summary</h1>
        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Read-only access</span>
      </div>
      {/* TODO: Fetch and render the 7-section doctor summary for this token */}
      <div style={{ background: "#1a1a2e", border: "1px solid #334155", borderRadius: "8px", padding: "24px" }}>
        <p style={{ color: "#94a3b8" }}>Loading patient summary...</p>
      </div>
    </div>
  );
}
