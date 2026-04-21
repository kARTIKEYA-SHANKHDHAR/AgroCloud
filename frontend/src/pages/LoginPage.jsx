import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const LoginPage = () => {
  const { login, confirmSignup, resendCode, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.name === "UserNotConfirmedException") {
        setShowVerification(true);
        setError("Your account is not verified yet. We've shown the verification box below. Please enter the code from your email.");
      } else {
        setError(err.message || "Login failed. Check your email and password.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Verification (If they were unconfirmed)
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await confirmSignup(email, code);
      setSuccess("Account verified successfully! You can now log in.");
      setShowVerification(false);
      setCode("");
    } catch (err) {
      setError(err.message || "Verification failed. Check the code.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendCode(email);
      setSuccess("New verification code sent to your email!");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(role === "admin" ? "/admin" : "/farmer", { replace: true });
    }
  }, [user, role, authLoading]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)", transition: "background-color 0.25s ease" }}>
      
      {/* Left branding panel */}
      <div 
        style={{
          width: "42%",
          background: "linear-gradient(160deg, #1a4d2e 0%, #2d6a4f 60%, #4a8c6a 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
        }}
        className="hide-on-mobile lg-flex"
      >
        <img src="/gla-logo.png" alt="GLA University" style={{ height: "7rem", width: "auto", filter: "brightness(0) invert(1)", marginBottom: "2rem" }} />
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, textAlign: "center", marginBottom: "0.75rem" }}>AgroCloud</h2>
        <p style={{ color: "#bbf7d0", fontSize: "0.875rem", textAlign: "center", maxWidth: "20rem", lineHeight: 1.6 }}>
          Pure AWS Cloud-Based Smart Irrigation Prediction System — Empowering farmers with AI-driven water management.
        </p>
      </div>

      {/* Right panel */}
      <div 
        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}
        className="mobile-p-4"
      >
        
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <ThemeToggle />
        </div>

        <div style={{ width: "100%", maxWidth: "26rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <img src="/gla-logo.png" alt="GLA University" style={{ height: "4rem", width: "auto" }} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {showVerification ? "Verify your account" : "Welcome back"}
            </h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {showVerification ? `Enter the code sent to ${email}` : "Sign in to your Pure AWS AgroCloud account"}
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && <div className="status-box error">{error}</div>}
          {success && <div className="status-box success">{success}</div>}

          {!showVerification ? (
            /* Standard Login Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Email address</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={isLoggingIn}>
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            /* Verification Form (Shown if user is unconfirmed) */
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Verification Code</label>
                <input type="text" className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} required />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={isLoggingIn}>
                {isLoggingIn ? "Verifying..." : "Verify & Activate"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <button type="button" onClick={handleResend} style={{ background: "none", border: "none", color: "var(--gla-green-text)", fontSize: "0.875rem", cursor: "pointer" }}>
                  Resend Code
                </button>
                <button type="button" onClick={() => setShowVerification(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.875rem", cursor: "pointer" }}>
                  Back to login
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            New to AgroCloud?{" "}
            <Link to="/signup" style={{ fontWeight: 600, color: "var(--gla-green-text)", textDecoration: "none" }}>Create an account</Link>
          </p>
        </div>
      </div>

      <style>{`
        .status-box {
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .error {
          border: 1px solid #fca5a5;
          background-color: rgba(254,202,202,0.2);
          color: #dc2626;
        }
        .success {
          border: 1px solid #86efac;
          background-color: rgba(220,252,231,0.2);
          color: #16a34a;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;