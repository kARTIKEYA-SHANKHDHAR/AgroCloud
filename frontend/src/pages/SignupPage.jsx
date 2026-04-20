import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false); // Cognito signup success -> show confirmation UI

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      // Cognito doesn't auto-login on signup; usually requires verification.
      // For this simplified version, we'll just show success and redirect to login.
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-green-200 dark:border-green-800/40 bg-white dark:bg-slate-800 p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-3xl">✅</div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100">Account Created!</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Your AWS Cognito account has been created. Please check your email for a verification link, then log in.
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary mt-6 w-full">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)", transition: "background-color 0.25s ease" }}>
      {/* Left green branding panel */}
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
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, textAlign: "center", marginBottom: "0.75rem" }}>Join AgroCloud</h2>
        <p style={{ color: "#bbf7d0", fontSize: "0.875rem", textAlign: "center", maxWidth: "20rem", lineHeight: 1.6 }}>
          Register as a farmer and start receiving AI-powered irrigation recommendations tailored to your crops.
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>Create your account</h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sign up as a farmer on the AWS Cloud Stack.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Email address</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ chars, Uppercase + Numeric" required />
            </div>

            {error && (
              <div style={{
                borderRadius: "0.5rem", border: "1px solid #fca5a5",
                backgroundColor: "rgba(254,202,202,0.2)", padding: "0.625rem 0.75rem",
                fontSize: "0.875rem", color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 600, color: "var(--gla-green-text)", textDecoration: "none" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
