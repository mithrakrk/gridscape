// Caregiver auth page — OTP-based login / account creation
// Phone number first, then OTP verification, then redirect to dashboard

"use client";
import { useState } from "react";

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: POST /api/auth/request-otp { phone }
    // On success: move to OTP step
    setStep("otp");
    setLoading(false);
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: POST /api/auth/verify-otp { phone, otp }
    // On success: redirect to /dashboard
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "400px", border: "1px solid #334155" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "#7c3aed" }}>Kavach</h1>
        <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "0.9rem" }}>
          {step === "phone" ? "Enter your mobile number to continue" : `Enter the OTP sent to +91 ${phone}`}
        </p>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Mobile Number</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <span style={{ background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "#94a3b8" }}>+91</span>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" required maxLength={10}
                style={{ flex: 1, background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "white", outline: "none" }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>6-Digit OTP</label>
            <input
              type="text" value={otp} onChange={e => setOtp(e.target.value)}
              placeholder="123456" required maxLength={6} inputMode="numeric"
              style={{ width: "100%", background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "white", outline: "none", marginBottom: "24px", letterSpacing: "0.3em", textAlign: "center", fontSize: "1.2rem" }}
            />
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button type="button" onClick={() => setStep("phone")} style={{ width: "100%", background: "none", color: "#94a3b8", border: "none", padding: "12px", cursor: "pointer", marginTop: "8px" }}>
              Change number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
