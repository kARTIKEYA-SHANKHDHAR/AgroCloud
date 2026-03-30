import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

/* ─── Snap row badge colours — works in both themes ─── */
const SNAP_COLORS = [
  { text: "#166534", bg: "#dcfce7", darkText: "#86efac", darkBg: "rgba(20,83,45,0.3)" },
  { text: "#92400e", bg: "#fef3c7", darkText: "#fcd34d", darkBg: "rgba(120,53,15,0.3)" },
  { text: "#166534", bg: "#dcfce7", darkText: "#86efac", darkBg: "rgba(20,83,45,0.3)" },
  { text: "#1e40af", bg: "#dbeafe", darkText: "#93c5fd", darkBg: "rgba(30,58,138,0.3)" },
  { text: "#6b21a8", bg: "#f3e8ff", darkText: "#d8b4fe", darkBg: "rgba(88,28,135,0.3)" },
];

const LandingPage = () => {
  const { t } = useLanguage();
  const [isDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Re-render when theme changes
  const [, forceRender] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => forceRender((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const dark = document.documentElement.classList.contains("dark");

  const FEATURES = [
    { icon: "🌧️", title: t.feat1Title, desc: t.feat1Desc, lBg: "#f0fdf4", lBd: "#bbf7d0", dBg: "rgba(20,83,45,0.18)", dBd: "#166534" },
    { icon: "☁️", title: t.feat2Title, desc: t.feat2Desc, lBg: "#eff6ff", lBd: "#bfdbfe", dBg: "rgba(30,58,138,0.18)", dBd: "#1d4ed8" },
    { icon: "📊", title: t.feat3Title, desc: t.feat3Desc, lBg: "#fffbeb", lBd: "#fde68a", dBg: "rgba(120,53,15,0.18)", dBd: "#b45309" },
    { icon: "🔒", title: t.feat4Title, desc: t.feat4Desc, lBg: "#faf5ff", lBd: "#e9d5ff", dBg: "rgba(88,28,135,0.18)", dBd: "#7c3aed" },
  ];

  const SNAP_ROWS = [
    { label: t.snapRow1Label, value: t.snapRow1Value },
    { label: t.snapRow2Label, value: t.snapRow2Value },
    { label: t.snapRow3Label, value: t.snapRow3Value },
    { label: t.snapRow4Label, value: t.snapRow4Value },
    { label: t.snapRow5Label, value: t.snapRow5Value },
  ];

  const s = {  /* shorthand style helpers */
    page:         { backgroundColor: "var(--bg-base)",    color: "var(--text-primary)",   transition: "background-color 0.25s ease, color 0.25s ease" },
    surface:      { backgroundColor: "var(--bg-surface)",  borderColor: "var(--border)" },
    textPrimary:  { color: "var(--text-primary)" },
    textSecondary:{ color: "var(--text-secondary)" },
    textMuted:    { color: "var(--text-muted)" },
    textAccent:   { color: "var(--gla-green-text)" },
    border:       { borderColor: "var(--border)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", ...s.page }}>

      {/* GLA top bar */}
      <div className="gla-topbar">
        <span>{t.topBarLeft}</span>
        <span style={{ opacity: 0.7 }}>{t.topBarRight}</span>
      </div>

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", ...s.surface, boxShadow: "var(--shadow-sm)", transition: "background-color 0.25s ease" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img src="/gla-logo.png" alt="GLA University Logo" style={{ height: "3.5rem", width: "auto" }} />
            <div style={{ width: "1px", height: "2.5rem", backgroundColor: "var(--border)" }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.2, color: "var(--gla-green)" }}>AgroCloud</p>
              <p style={{ fontSize: "0.75rem", lineHeight: 1.2, ...s.textMuted }}>{t.appSubtitle}</p>
            </div>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <a href="#features" style={{ fontSize: "0.875rem", fontWeight: 500, padding: "0 0.5rem", textDecoration: "none", ...s.textSecondary }}>{t.navFeatures}</a>
            <a href="#about"    style={{ fontSize: "0.875rem", fontWeight: 500, padding: "0 0.5rem", textDecoration: "none", ...s.textSecondary }}>{t.navAbout}</a>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/login"  className="btn-secondary" style={{ padding: "0.375rem 0.875rem" }}>{t.navLogin}</Link>
            <Link to="/signup" className="btn-primary"   style={{ padding: "0.375rem 0.875rem" }}>{t.navGetStarted}</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <section style={{ maxWidth: "80rem", margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>
          <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "3fr 2fr", alignItems: "center" }}>

            {/* Left copy */}
            <div className="animate-fadeInUp">
              {/* Badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                borderRadius: "9999px", border: "1px solid var(--gla-green-100)",
                backgroundColor: "var(--gla-green-bg)", padding: "0.25rem 0.75rem",
                fontSize: "0.75rem", fontWeight: 600, marginBottom: "1rem",
                color: "var(--gla-green-text)",
              }}>
                {t.heroBadge}
              </span>

              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1, ...s.textPrimary }}>
                {t.heroHeading1} <span style={s.textAccent}>{t.heroHeading2}</span>
              </h1>

              <p style={{ marginTop: "1.25rem", maxWidth: "36rem", fontSize: "1rem", lineHeight: 1.7, ...s.textSecondary }}>
                {t.heroBody1} <strong style={s.textPrimary}>{t.heroBodyBold}</strong> {t.heroBody2}
              </p>

              <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <Link to="/signup" className="btn-primary"   style={{ padding: "0.625rem 1.5rem" }}>{t.ctaPrimary}</Link>
                <Link to="/login"  className="btn-secondary" style={{ padding: "0.625rem 1.5rem" }}>{t.ctaSecondary}</Link>
              </div>
              <p style={{ marginTop: "1rem", fontSize: "0.75rem", ...s.textMuted }}>{t.techStack}</p>

              {/* Feature cards */}
              <div id="features" style={{ marginTop: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {FEATURES.map((f) => (
                  <div key={f.title} style={{
                    borderRadius: "1rem", padding: "1rem",
                    border: `1px solid ${dark ? f.dBd : f.lBd}`,
                    backgroundColor: dark ? f.dBg : f.lBg,
                    transition: "box-shadow 0.2s",
                  }}>
                    <p style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{f.icon}</p>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem", ...s.textPrimary }}>{f.title}</p>
                    <p style={{ fontSize: "0.75rem", lineHeight: 1.6, ...s.textSecondary }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: snapshot card */}
            <div className="animate-fadeInUp">
              <div style={{ borderRadius: "1.5rem", border: "1px solid var(--border)", ...s.surface, boxShadow: "var(--shadow-md)", overflow: "hidden", transition: "background-color 0.25s ease" }}>
                {/* Dark green header — always green */}
                <div style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, #1a4d2e, #2d6a4f)" }}>
                  <img src="/gla-logo.png" alt="GLA" style={{ height: "2.25rem", width: "auto", filter: "brightness(0) invert(1)", opacity: 0.9, marginBottom: "0.75rem" }} />
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#86efac" }}>{t.snapshotBadge}</p>
                  <p style={{ color: "white", fontSize: "0.875rem", marginTop: "0.25rem" }}>{t.snapshotSubtitle}</p>
                </div>

                {/* Metric rows */}
                <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {SNAP_ROWS.map((m, i) => {
                    const c = SNAP_COLORS[i];
                    return (
                      <div key={m.label} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderRadius: "0.75rem", border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-surface-3)", padding: "0.625rem 1rem",
                      }}>
                        <span style={{ fontSize: "0.875rem", ...s.textSecondary }}>{m.label}</span>
                        <span style={{
                          fontSize: "0.75rem", fontWeight: 600, borderRadius: "9999px",
                          padding: "0.125rem 0.625rem",
                          color: dark ? c.darkText : c.text,
                          backgroundColor: dark ? c.darkBg : c.bg,
                        }}>{m.value}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", ...s.textMuted }}>{t.snapshotCta1}</span>
                  <Link to="/signup" style={{
                    borderRadius: "9999px", border: "1px solid #1a4d2e", padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem", fontWeight: 600, color: "var(--gla-green-text)", textDecoration: "none",
                    transition: "background 0.15s",
                  }}>
                    {t.snapshotCta2}
                  </Link>
                </div>
              </div>

              {/* GLA Badge */}
              <div id="about" style={{
                marginTop: "1rem", borderRadius: "0.75rem", border: "1px solid var(--border)",
                ...s.surface, padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem",
                boxShadow: "var(--shadow-sm)", transition: "background-color 0.25s ease",
              }}>
                <img src="/gla-logo.png" alt="GLA University" style={{ height: "2.5rem", width: "auto" }} />
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, ...s.textPrimary }}>{t.glaBadgeLine1}</p>
                  <p style={{ fontSize: "0.75rem", ...s.textMuted }}>{t.glaBadgeLine2}</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", ...s.surface, padding: "1.5rem 0", transition: "background-color 0.25s ease" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src="/gla-logo.png" alt="GLA University" style={{ height: "2rem", width: "auto" }} />
            <span style={{ fontSize: "0.75rem", ...s.textMuted }}>{t.footerBrand}</span>
          </div>
          <p style={{ fontSize: "0.75rem", ...s.textMuted }}>{t.footerRights}</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
