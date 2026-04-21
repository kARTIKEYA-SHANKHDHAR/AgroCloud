import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const SignupPage = () => {
  const { signup, confirmSignup, resendCode } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1); // 1: Signup, 2: Verification

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      // Success! Move to verification step
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignup(email, code);
      // Success! Now we can redirect to login
      navigate("/login", { state: { message: "Account verified! You can now log in." } });
    } catch (err) {
      setError(err.message || "Verification failed. Check the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendCode(email);
      alert("New verification code sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)", transition: "background-color 0.25s ease" }}>
      {/* Left branding panel (hidden on mobile) */}
      <div style={{
        display: "none",
        width: "42%",
        background: "linear-gradient(160deg, #1a4d2e 0%, #2d6a4f 60%, #4a8c6a 100%)",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
      }}
        className="lg-flex-col"
      >
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, textAlign: "center", marginBottom: "0.75rem" }}>
          {step === 1 ? "Join AgroCloud" : "Verify Email"}
        </h2>
        <p style={{ color: "#bbf7d0", fontSize: "0.875rem", textAlign: "center", maxWidth: "20rem", lineHeight: 1.6 }}>
          {step === 1 
            ? "Register as a farmer and start receiving AI-powered irrigation recommendations tailored to your crops."
            : "We've sent a 6-digit verification code to your email. Enter it below to activate your Pure AWS account."}
        </p>
        <ul style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none", padding: 0, width: "100%", maxWidth: "20rem" }}>
          {["✓ Free farmer account", "✓ AI irrigation predictions", "✓ Cloud-based history (DynamoDB)", "✓ Pure AWS Authentication (Cognito)"].map((item) => (
            <li key={item} style={{ color: "#d1fae5", fontSize: "0.875rem" }}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <ThemeToggle />
        </div>
        <div style={{ width: "100%", maxWidth: "26rem" }}>
          
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {step === 1 ? "Create your account" : "Verify your identity"}
            </h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {step === 1 ? "Sign up as a farmer on the AWS Cloud Stack." : `A code was sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            /* Signup Form */
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Email address</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ chars, Uppercase + Numeric" required />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          ) : (
            /* Verification Form */
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Verification Code</label>
                <input type="text" className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} required />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Activate"}
              </button>

              <button type="button" onClick={handleResend} style={{ background: "none", border: "none", color: "var(--gla-green-text)", fontSize: "0.875rem", cursor: "pointer", marginTop: "0.5rem" }}>
                Didn't receive a code? Resend
              </button>
            </form>
          )}

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            {step === 1 ? (
              <>Already have an account? <Link to="/login" style={{ fontWeight: 600, color: "var(--gla-green-text)", textDecoration: "none" }}>Log in</Link></>
            ) : (
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.875rem", cursor: "pointer" }}>← Back to signup</button>
            )}
          </p>
        </div>
      </div>
      
      <style>{`
        .error-box {
          border-radius: 0.5rem;
          border: 1px solid #fca5a5;
          background-color: rgba(254,202,202,0.2);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
