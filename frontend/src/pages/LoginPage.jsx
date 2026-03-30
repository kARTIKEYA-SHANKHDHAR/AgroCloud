import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const LoginPage = () => {
  const { login, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "admin" ? "/admin" : "/farmer", { replace: true });
    }
  }, [user, role, loading]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)", transition: "background-color 0.25s ease" }}>

      {/* Left green panel — always dark green */}
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
        <h2 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, textAlign: "center", marginBottom: "0.75rem" }}>AgroCloud</h2>
        <p style={{ color: "#bbf7d0", fontSize: "0.875rem", textAlign: "center", maxWidth: "20rem", lineHeight: 1.6 }}>
          Cloud-Based Smart Irrigation Prediction System — A GLA University initiative
          empowering farmers with AI-driven water management.
        </p>
        <div style={{ marginTop: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%", maxWidth: "20rem" }}>
          {[
            { stat: "ML", label: "Random Forest Model" },
            { stat: "Cloud", label: "Firebase Backend" },
            { stat: "2025", label: "Academic Year" },
            { stat: "GLA", label: "Mathura, U.P." },
          ].map((s) => (
            <div key={s.label} style={{ borderRadius: "0.75rem", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.75rem", textAlign: "center" }}>
              <p style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{s.stat}</p>
              <p style={{ color: "#86efac", fontSize: "0.7rem", marginTop: "0.15rem" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem", position: "relative" }}>
        
        {/* Theme toggle */}
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <ThemeToggle />
        </div>

        <div style={{ width: "100%", maxWidth: "26rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <img src="/gla-logo.png" alt="GLA University" style={{ height: "4rem", width: "auto" }} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>Welcome back</h1>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sign in to your AgroCloud account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Email address</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.375rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Password</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
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

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.625rem", marginTop: "0.5rem" }} disabled={loggingIn}>
              {loggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            New to AgroCloud?{" "}
            <Link to="/signup" style={{ fontWeight: 600, color: "var(--gla-green-text)", textDecoration: "none" }}>Create an account</Link>
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

export default LoginPage;