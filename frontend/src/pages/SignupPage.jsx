import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/farmer", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

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
        <img src="/gla-logo.png" alt="GLA University" style={{ height: "7rem", width: "auto", filter: "brightness(0) invert(1)", marginBottom: "2rem" }} />
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, textAlign: "center", marginBottom: "0.75rem" }}>Join AgroCloud</h2>
        <p style={{ color: "#bbf7d0", fontSize: "0.875rem", textAlign: "center", maxWidth: "20rem", lineHeight: 1.6 }}>
          Register as a farmer and start receiving AI-powered irrigation recommendations tailored to your crops.
        </p>
        <ul style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none", padding: 0, width: "100%", maxWidth: "20rem" }}>
          {["✓ Free farmer account", "✓ AI irrigation predictions", "✓ Historical analytics & trends", "✓ Secure Firebase authentication"].map((item) => (
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <img src="/gla-logo.png" alt="GLA University" style={{ height: "4rem", width: "auto" }} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>Create your account</h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sign up as a farmer · Admins can be promoted later.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Email address</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
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

          <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <img src="/gla-logo.png" alt="GLA" style={{ height: "1.5rem", width: "auto" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>GLA University, Mathura — B.Tech CSE Project 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
