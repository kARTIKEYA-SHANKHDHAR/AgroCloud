import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

// View states: "login" | "verify" | "forgot_email" | "forgot_reset" | "forgot_done"
const LoginPage = () => {
  const {
    login, confirmSignup, resendCode,
    forgotPassword, confirmForgotPassword,
    user, role, loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [busy, setBusy]       = useState(false);

  // ── Auto-redirect if already logged in ──────────────────────
  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(role === "admin" ? "/admin" : "/farmer", { replace: true });
    }
  }, [user, role, authLoading]);

  const clear = () => { setError(""); setSuccess(""); };

  // ── Handle Login ─────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.name === "UserNotConfirmedException") {
        setView("verify");
        setError("Account not verified. Enter the code sent to your email.");
      } else {
        setError(err.message || "Login failed. Check your credentials.");
      }
    } finally { setBusy(false); }
  };

  // ── Handle Verification ──────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      await confirmSignup(email, code);
      setSuccess("Account verified! You can now sign in.");
      setView("login"); setCode("");
    } catch (err) {
      setError(err.message || "Verification failed. Check the code.");
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    clear();
    try {
      await resendCode(email);
      setSuccess("New verification code sent to your email!");
    } catch (err) { setError(err.message || "Failed to resend code"); }
  };

  // ── Forgot Password Step 1: Send code ───────────────────────
  const handleForgotRequest = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      await forgotPassword(email);
      setSuccess(`Reset code sent to ${email}. Check your inbox.`);
      setView("forgot_reset");
    } catch (err) {
      setError(err.message || "Could not send reset code. Check your email address.");
    } finally { setBusy(false); }
  };

  // ── Forgot Password Step 2: Confirm new password ────────────
  const handleForgotConfirm = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      setView("forgot_done");
    } catch (err) {
      setError(err.message || "Password reset failed. Try again.");
    } finally { setBusy(false); }
  };

  // ── View helpers ─────────────────────────────────────────────
  const titles = {
    login:        "Welcome back",
    verify:       "Verify your account",
    forgot_email: "Forgot password",
    forgot_reset: "Reset your password",
    forgot_done:  "Password changed!",
  };
  const subtitles = {
    login:        "Sign in to your AgroCloud account",
    verify:       `Enter the code sent to ${email}`,
    forgot_email: "We'll email you a reset code",
    forgot_reset: `Enter the code sent to ${email} and your new password`,
    forgot_done:  "Your password has been reset. Sign in now.",
  };

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }} className="mobile-p-4">
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <ThemeToggle />
        </div>

        <div style={{ width: "100%", maxWidth: "26rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <img src="/gla-logo.png" alt="GLA University" style={{ height: "4rem", width: "auto" }} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {titles[view]}
            </h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {subtitles[view]}
            </p>
          </div>

          {/* Messages */}
          {error   && <div className="status-box error">{error}</div>}
          {success && <div className="status-box success">{success}</div>}

          {/* ── LOGIN form ── */}
          {view === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input id="login-email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                  <label style={labelStyle}>Password</label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => { clear(); setView("forgot_email"); }}
                    style={{ background: "none", border: "none", color: "var(--gla-green-text, #16a34a)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input id="login-password" type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button id="login-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          {/* ── VERIFY form ── */}
          {view === "verify" && (
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Verification Code</label>
                <input id="verify-code" type="text" className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem" }} disabled={busy}>
                {busy ? "Verifying..." : "Verify & Activate"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" onClick={handleResend} style={ghostBtn("#16a34a")}>Resend Code</button>
                <button type="button" onClick={() => { clear(); setView("login"); }} style={ghostBtn("var(--text-muted)")}>Back to login</button>
              </div>
            </form>
          )}

          {/* ── FORGOT: Step 1 — Enter email ── */}
          {view === "forgot_email" && (
            <form onSubmit={handleForgotRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input id="forgot-email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button id="forgot-send-code" type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem" }} disabled={busy}>
                {busy ? "Sending..." : "Send Reset Code"}
              </button>
              <div style={{ textAlign: "center" }}>
                <button type="button" onClick={() => { clear(); setView("login"); }} style={ghostBtn("var(--text-muted)")}>Back to login</button>
              </div>
            </form>
          )}

          {/* ── FORGOT: Step 2 — Enter code + new password ── */}
          {view === "forgot_reset" && (
            <form onSubmit={handleForgotConfirm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Reset Code</label>
                <input id="reset-code" type="text" className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} required />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input id="new-password" type="password" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 chars, uppercase & number" required minLength={8} />
              </div>
              <button id="reset-submit" type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem" }} disabled={busy}>
                {busy ? "Resetting..." : "Reset Password"}
              </button>
              <div style={{ textAlign: "center" }}>
                <button type="button" onClick={() => { clear(); setView("forgot_email"); }} style={ghostBtn("var(--text-muted)")}>← Back</button>
              </div>
            </form>
          )}

          {/* ── FORGOT: Step 3 — Done ── */}
          {view === "forgot_done" && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                id="goto-login-after-reset"
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "0.625rem" }}
                onClick={() => { clear(); setView("login"); setCode(""); setNewPassword(""); }}
              >
                Sign in now
              </button>
            </div>
          )}

          {/* Bottom link */}
          {view === "login" && (
            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              New to AgroCloud?{" "}
              <Link to="/signup" style={{ fontWeight: 600, color: "var(--gla-green-text, #16a34a)", textDecoration: "none" }}>Create an account</Link>
            </p>
          )}
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

const labelStyle = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--text-primary)",
};

const ghostBtn = (color) => ({
  background: "none",
  border: "none",
  color,
  fontSize: "0.875rem",
  cursor: "pointer",
  padding: 0,
});

export default LoginPage;