import React, { useState, useEffect, useRef } from "react";
import { getLatestSensors } from "../services/api";

// ── Threshold config ──────────────────────────────────────────────────────────
const SENSORS = [
  {
    key: "moisture",
    label: "Soil Moisture",
    unit: "%",
    icon: "💧",
    thresholds: { warning: 45, critical: 30 },
    direction: "below", // alert when value goes BELOW threshold
    range: [0, 100],
  },
  {
    key: "water_level",
    label: "Water Level",
    unit: "%",
    icon: "🌊",
    thresholds: { warning: 40, critical: 20 },
    direction: "below",
    range: [0, 100],
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: "🌡️",
    thresholds: { warning: 30, critical: 35 },
    direction: "above", // alert when value goes ABOVE threshold
    range: [0, 50],
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    icon: "☁️",
    thresholds: { warning: 80, critical: 90 },
    direction: "above",
    range: [0, 100],
  },
  {
    key: "soil_ph",
    label: "Soil pH",
    unit: "",
    icon: "🧪",
    // pH is normal between 6.0-7.0, warning 5.5-8.0, critical outside that
    thresholds: { warningLow: 6.0, warningHigh: 7.0, criticalLow: 5.5, criticalHigh: 7.5 },
    direction: "range",
    range: [0, 14],
  },
];

function getStatus(sensor, value) {
  if (value === null || value === undefined) return "unknown";
  const v = parseFloat(value);
  if (isNaN(v)) return "unknown";

  if (sensor.direction === "below") {
    if (v <= sensor.thresholds.critical) return "critical";
    if (v <= sensor.thresholds.warning) return "warning";
    return "normal";
  }
  if (sensor.direction === "above") {
    if (v >= sensor.thresholds.critical) return "critical";
    if (v >= sensor.thresholds.warning) return "warning";
    return "normal";
  }
  if (sensor.direction === "range") {
    const { criticalLow, criticalHigh, warningLow, warningHigh } = sensor.thresholds;
    if (v < criticalLow || v > criticalHigh) return "critical";
    if (v < warningLow || v > warningHigh) return "warning";
    return "normal";
  }
  return "normal";
}

const STATUS_CONFIG = {
  normal:   { label: "Normal",   dot: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.30)",  text: "#16a34a" },
  warning:  { label: "Warning",  dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.30)", text: "#b45309" },
  critical: { label: "Critical", dot: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.30)",  text: "#dc2626" },
  unknown:  { label: "No Data",  dot: "#94a3b8", bg: "rgba(148,163,184,0.08)",border: "rgba(148,163,184,0.20)",text: "#64748b" },
};

function BarMeter({ value, min = 0, max = 100, status }) {
  const pct = Math.min(100, Math.max(0, ((parseFloat(value) - min) / (max - min)) * 100));
  const color = STATUS_CONFIG[status]?.dot || "#94a3b8";
  return (
    <div style={{ marginTop: "0.5rem", height: "4px", borderRadius: "99px", background: "rgba(148,163,184,0.15)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px", transition: "width 0.6s ease" }} />
    </div>
  );
}

function SensorCard({ sensor, value, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const displayValue = value !== null && value !== undefined ? `${parseFloat(value).toFixed(1)}${sensor.unit}` : "—";
  const isAnimating = status === "critical";

  return (
    <div style={{
      background: "var(--card-bg, #0f172a)",
      border: `1.5px solid ${cfg.border}`,
      borderRadius: "1rem",
      padding: "1rem 1.125rem",
      transition: "all 0.4s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle glow background */}
      <div style={{ position: "absolute", inset: 0, background: cfg.bg, pointerEvents: "none", borderRadius: "1rem" }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>{sensor.icon}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8" }}>
            {sensor.label}
          </span>
        </div>

        {/* Status badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: "99px", padding: "0.15rem 0.5rem",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot,
            boxShadow: isAnimating ? `0 0 0 2px ${cfg.dot}40` : "none",
            animation: isAnimating ? "pulse-dot 1.2s ease-in-out infinite" : "none",
          }} />
          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: cfg.text }}>{cfg.label}</span>
        </div>
      </div>

      {/* Value */}
      <div style={{ position: "relative" }}>
        <p style={{ fontSize: "1.6rem", fontWeight: 900, color: "#f1f5f9", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {displayValue}
        </p>
        <BarMeter value={value} min={sensor.range[0]} max={sensor.range[1]} status={status} />
      </div>
    </div>
  );
}

const SensorSection = () => {
  const [sensors, setSensors]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const intervalRef               = useRef(null);

  const fetchData = async () => {
    try {
      const res = await getLatestSensors();
      // API returns { thing_id, alerts, payload: { moisture, temperature, ... } }
      const wrapper = res.data;
      const d = wrapper?.payload || wrapper; // unwrap nested payload
      if (d && Object.keys(d).length > 1) {
        setSensors(d);
        setLastUpdated(new Date());
        setError(false);
      }
    } catch (err) {
      setError(true);
      console.error("Sensor fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Derive statuses ────────────────────────────────────────────────────────
  const hasData = sensors && Object.keys(sensors).length > 1 && !error;
  const alerts  = sensors?.alerts || [];
  const criticalAlerts = alerts.filter(a => a.level === "critical");
  const warningAlerts  = alerts.filter(a => a.level === "warning");

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* ── Section Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Live dot */}
          <span style={{ position: "relative", display: "inline-flex", width: "10px", height: "10px" }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: hasData ? "#22c55e" : "#94a3b8",
              animation: hasData ? "ping 1.2s cubic-bezier(0,0,0.2,1) infinite" : "none",
              opacity: 0.6,
            }} />
            <span style={{
              position: "relative", display: "inline-flex", borderRadius: "50%",
              width: "10px", height: "10px",
              background: hasData ? "#22c55e" : "#64748b",
            }} />
          </span>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Live Sensor Data
            <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 500, color: "#64748b", verticalAlign: "middle" }}>
              via AWS IoT Core
            </span>
          </h2>
        </div>

        {/* Last Updated */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {lastUpdatedStr && (
            <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
              🕐 Last updated: <strong style={{ color: "#94a3b8" }}>{lastUpdatedStr}</strong>
            </span>
          )}
          {/* Alert summary badges */}
          {criticalAlerts.length > 0 && (
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#dc2626", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "99px", padding: "0.15rem 0.5rem" }}>
              ⛔ {criticalAlerts.length} Critical
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#b45309", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "99px", padding: "0.15rem 0.5rem" }}>
              ⚠️ {warningAlerts.length} Warning
            </span>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      {loading && !hasData ? (
        /* Loading skeleton */
        <div style={{ borderRadius: "1rem", border: "1.5px dashed rgba(148,163,184,0.2)", padding: "2.5rem", textAlign: "center", background: "rgba(15,23,42,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.3rem", marginBottom: "0.75rem" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#334155", animation: `bounce 0.9s ${i * 0.15}s ease-in-out infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Connecting to AWS IoT Core...</p>
        </div>
      ) : !hasData ? (
        /* Waiting state */
        <div style={{ borderRadius: "1rem", border: "1.5px dashed rgba(148,163,184,0.2)", padding: "2.5rem", textAlign: "center", background: "rgba(15,23,42,0.4)" }}>
          <p style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>📡</p>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.25rem" }}>Waiting for sensor data...</p>
          <p style={{ fontSize: "0.72rem", color: "#475569" }}>Run <code style={{ background: "#1e293b", padding: "0.1rem 0.4rem", borderRadius: "0.3rem", color: "#7dd3fc" }}>python3 iot_simulator.py</code> to start sending data.</p>
        </div>
      ) : (
        <>
          {/* Alert banner (only if critical) */}
          {criticalAlerts.length > 0 && (
            <div style={{ marginBottom: "0.875rem", background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)", borderRadius: "0.75rem", padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem" }}>🚨</span>
              <p style={{ fontSize: "0.75rem", color: "#fca5a5", fontWeight: 600, margin: 0 }}>
                {criticalAlerts.map(a => a.msg).join(" · ")}
              </p>
            </div>
          )}

          {/* Sensor cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
            {SENSORS.map((sensor) => {
              const value  = sensors[sensor.key] ?? null;
              const status = getStatus(sensor, value);
              return <SensorCard key={sensor.key} sensor={sensor} value={value} status={status} />;
            })}
          </div>
        </>
      )}

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default SensorSection;
