"use client";
/**
 * apps/web/app/auth/page.tsx
 * Caregiver login page — phone number → OTP flow.
 * Calls /api/auth/request-otp and /api/auth/verify-otp.
 * On success redirects to /dashboard (or ?next= param).
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "phone" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? "/dashboard";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Only populated in dev/test — never shown in prod
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Clear devOtp banner when moving back to phone step
  useEffect(() => {
    if (step === "phone") setDevOtp(null);
  }, [step]);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(friendlyError(data.error));
        return;
      }

      // Dev/test only — show OTP for testing without SMS
      if (data._devOtp) setDevOtp(data._devOtp);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(friendlyError(data.error));
        if (data.error === "LOCKED" || data.error === "EXPIRED") {
          // Force back to phone step so they can request a new OTP
          setTimeout(() => { setStep("phone"); setOtp(""); }, 2000);
        }
        return;
      }

      // Session cookie is now set — redirect
      router.replace(nextPath);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "40px", width: "100%", maxWidth: "400px", border: "1px solid #334155" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px", color: "#7c3aed" }}>Kavach</h1>
        <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "0.9rem" }}>
          {step === "phone"
            ? "Enter your mobile number to continue"
            : `Enter the OTP sent to +91 ${phone}`}
        </p>

        {/* Dev-only OTP banner — never rendered in production */}
        {devOtp && (
          <div style={{ background: "#1e3a1e", border: "1px solid #22c55e", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", fontSize: "0.8rem", color: "#86efac" }}>
            <strong>[DEV]</strong> OTP: <code style={{ letterSpacing: "0.2em" }}>{devOtp}</code>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#cbd5e1" }}>
              Mobile Number
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <span style={{ background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "#94a3b8", flexShrink: 0 }}>+91</span>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                maxLength={10}
                autoFocus
                style={{ flex: 1, background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "white", outline: "none", fontSize: "1rem" }}
              />
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}
            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading || phone.length < 10}
              style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: loading || phone.length < 10 ? 0.6 : 1 }}
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#cbd5e1" }}>
              6-Digit OTP
            </label>
            <input
              id="otp-input"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              required
              maxLength={6}
              inputMode="numeric"
              autoFocus
              style={{ width: "100%", background: "#0f0f1a", border: "1px solid #334155", borderRadius: "6px", padding: "12px", color: "white", outline: "none", marginBottom: "24px", letterSpacing: "0.4em", textAlign: "center", fontSize: "1.4rem", boxSizing: "border-box" }}
            />
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</p>}
            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading || otp.length < 6}
              style={{ width: "100%", background: "#7c3aed", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", opacity: loading || otp.length < 6 ? 0.6 : 1 }}
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <button
              id="change-number-btn"
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              style={{ width: "100%", background: "none", color: "#94a3b8", border: "none", padding: "12px", cursor: "pointer", marginTop: "8px", fontSize: "0.9rem" }}
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function friendlyError(code: string): string {
  switch (code) {
    case "MISSING_PHONE":
    case "INVALID_PHONE":
      return "Please enter a valid 10-digit Indian mobile number.";
    case "MISSING_FIELDS":
      return "Something went wrong. Please refresh and try again.";
    case "INVALID_OTP":
      return "Incorrect OTP. Please check and try again.";
    case "EXPIRED":
      return "OTP has expired. Sending you back to request a new one.";
    case "LOCKED":
      return "Too many attempts. Please request a new OTP.";
    case "NO_OTP":
      return "No OTP found. Please request a new one.";
    default:
      return "Something went wrong. Please try again.";
  }
}
