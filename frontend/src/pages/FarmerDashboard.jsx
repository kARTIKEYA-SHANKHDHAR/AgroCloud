import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import WeatherWidget from "../components/WeatherWidget";
import FarmSetupModal from "../components/FarmSetupModal";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePredictions } from "../context/PredictionContext";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { predictions, clearHistory } = usePredictions();
  const navigate = useNavigate();
  const [showFarmModal, setShowFarmModal] = useState(false);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPredictions  = predictions.length;
  const irrigationNeeded  = predictions.filter((p) => p.prediction === 1).length;
  const noIrrigation      = totalPredictions - irrigationNeeded;

  // ── Trend chart data ────────────────────────────────────────────────────────
  const { trendLabels, irrigationSeries, noIrrigationSeries } = useMemo(() => {
    const counts = {};
    predictions.forEach((p) => {
      const day =
        typeof p.timestamp === "string"
          ? p.timestamp.slice(0, 10)
          : p.timestamp?.toDate?.()?.toISOString?.()?.slice(0, 10) || "unknown";
      if (!counts[day]) counts[day] = { irrigationNeeded: 0, noIrrigation: 0 };
      if (p.prediction === 1) counts[day].irrigationNeeded += 1;
      else counts[day].noIrrigation += 1;
    });
    const labels = Object.keys(counts).sort();
    return {
      trendLabels: labels,
      irrigationSeries:  labels.map((d) => counts[d].irrigationNeeded),
      noIrrigationSeries: labels.map((d) => counts[d].noIrrigation),
    };
  }, [predictions]);

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: t.dashIrrigationNeeded,
        data: irrigationSeries,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.12)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#f59e0b",
      },
      {
        label: t.dashWaterSaved,
        data: noIrrigationSeries,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.12)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#22c55e",
      },
    ],
  };

  return (
    <Layout>
      <FarmSetupModal open={showFarmModal} onClose={() => setShowFarmModal(false)} />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {t.dashTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t.dashSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/farmer/prediction")}
          className="btn-primary"
        >
          + {t.sidePrediction}
        </button>
      </div>

      {/* ── Live weather banner ── */}
      <div className="mb-5">
        <WeatherWidget onSetupFarm={() => setShowFarmModal(true)} />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label={t.dashTotalPreds}
          value={totalPredictions}
          hint={t.dashTotalPredsHint}
        />
        <StatCard
          label={t.dashIrrigationNeeded}
          value={irrigationNeeded}
          hint={t.dashIrrigationNeededHint}
          tone="warning"
        />
        <StatCard
          label={t.dashWaterSaved}
          value={noIrrigation}
          hint={t.dashWaterSavedHint}
          tone="success"
        />
      </div>

      {/* Empty state */}
      {totalPredictions === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-10 text-center">
          <p className="text-4xl mb-3">🌾</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            No predictions yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            Run your first irrigation prediction to see your dashboard come alive.
          </p>
          <button
            type="button"
            onClick={() => navigate("/farmer/prediction")}
            className="btn-primary mt-4"
          >
            Run Prediction
          </button>
        </div>
      )}

      {/* Chart + recent predictions */}
      {totalPredictions > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Trend chart */}
          <ChartCard
            title={t.dashDecisionsChart}
            description={t.dashDecisionsDesc}
            type="line"
            data={trendData}
          />

          {/* Recent predictions list */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100">
                {t.dashRecentPreds}
              </p>
              <button
                type="button"
                onClick={clearHistory}
                className="text-[10px] text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                title="Clear prediction history"
              >
                Clear history
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-400 dark:text-slate-500">
              {t.dashRecentPredsDesc}
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
              {predictions.map((p) => {
                const ts =
                  typeof p.timestamp === "string"
                    ? new Date(p.timestamp)
                    : p.timestamp?.toDate?.() || new Date();
                const timeStr = ts.toLocaleString();
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-slate-300">
                        {p.crop} – {p.soil}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                        {p.temperature}°C · {p.humidity}%rh · {p.rainfall}mm rain
                      </p>
                      <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-0.5">
                        {timeStr}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        p.prediction === 1
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                          : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {p.prediction === 1 ? "💧 Irrigate" : "✓ Skip"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FarmerDashboard;
