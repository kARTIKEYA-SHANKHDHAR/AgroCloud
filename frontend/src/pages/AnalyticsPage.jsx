import React, { useMemo } from "react";
import Layout from "../components/Layout";
import ChartCard from "../components/ChartCard";
import StatCard from "../components/StatCard";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePredictions } from "../context/PredictionContext";

const AnalyticsPage = ({ mode }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { predictions } = usePredictions();

  // ── Build daily trend series ────────────────────────────────────────────────
  const { labels, irrigationSeries, noIrrigationSeries } = useMemo(() => {
    const daily = {};
    predictions.forEach((p) => {
      const day =
        typeof p.timestamp === "string"
          ? p.timestamp.slice(0, 10)
          : p.timestamp?.toDate?.()?.toISOString?.()?.slice(0, 10) || "unknown";
      if (!daily[day]) daily[day] = { irrigationNeeded: 0, noIrrigation: 0 };
      if (p.prediction === 1) daily[day].irrigationNeeded += 1;
      else daily[day].noIrrigation += 1;
    });
    const sortedLabels = Object.keys(daily).sort();
    return {
      labels: sortedLabels,
      irrigationSeries:  sortedLabels.map((d) => daily[d].irrigationNeeded),
      noIrrigationSeries: sortedLabels.map((d) => daily[d].noIrrigation),
    };
  }, [predictions]);

  // ── Build crop distribution ─────────────────────────────────────────────────
  const { cropLabels, cropValues } = useMemo(() => {
    const counts = {};
    predictions.forEach((p) => {
      const crop = p.crop || "Unknown";
      counts[crop] = (counts[crop] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      cropLabels: sorted.map(([k]) => k),
      cropValues: sorted.map(([, v]) => v),
    };
  }, [predictions]);

  // ── Build soil distribution ─────────────────────────────────────────────────
  const { soilLabels, soilValues, soilIrrigationRates } = useMemo(() => {
    const counts = {};
    const irrigations = {};
    predictions.forEach((p) => {
      const soil = p.soil || "Unknown";
      counts[soil] = (counts[soil] || 0) + 1;
      if (p.prediction === 1) irrigations[soil] = (irrigations[soil] || 0) + 1;
    });
    const keys = Object.keys(counts);
    return {
      soilLabels: keys,
      soilValues: keys.map((k) => counts[k]),
      soilIrrigationRates: keys.map((k) =>
        Math.round(((irrigations[k] || 0) / counts[k]) * 100)
      ),
    };
  }, [predictions]);

  const hasPredictions = predictions.length > 0;

  const trendData = {
    labels,
    datasets: [
      {
        label: t.dashIrrigationNeeded,
        data: irrigationSeries,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#f59e0b",
      },
      {
        label: t.dashWaterSaved,
        data: noIrrigationSeries,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#22c55e",
      },
    ],
  };

  const cropChartData = {
    labels: cropLabels,
    datasets: [
      {
        label: "Predictions per Crop",
        data: cropValues,
        backgroundColor: [
          "rgba(245,158,11,0.7)",
          "rgba(34,197,94,0.7)",
          "rgba(56,189,248,0.7)",
          "rgba(168,85,247,0.7)",
          "rgba(239,68,68,0.7)",
        ],
        borderColor: [
          "#f59e0b", "#22c55e", "#38bdf8", "#a855f7", "#ef4444"
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const soilChartData = {
    labels: soilLabels,
    datasets: [
      {
        label: "Irrigation Rate (%)",
        data: soilIrrigationRates,
        backgroundColor: "rgba(56,189,248,0.7)",
        borderColor: "#38bdf8",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Summary stats for analytics
  const irrigationRate =
    predictions.length > 0
      ? Math.round(
          (predictions.filter((p) => p.prediction === 1).length /
            predictions.length) *
            100
        )
      : 0;

  // Only include records with valid numeric values
  const validPredictions = predictions.filter(
    (p) => isFinite(Number(p.temperature)) && isFinite(Number(p.humidity))
  );

  const avgTemp =
    validPredictions.length > 0
      ? (
          validPredictions.reduce((s, p) => s + Number(p.temperature), 0) /
          validPredictions.length
        ).toFixed(1)
      : "—";

  const avgHumidity =
    validPredictions.length > 0
      ? (
          validPredictions.reduce((s, p) => s + Number(p.humidity), 0) /
          validPredictions.length
        ).toFixed(1)
      : "—";

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
          {mode === "admin" ? t.anaPlatformTitle : t.anaYourTitle}
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {mode === "admin" ? t.anaPlatformSubtitle : t.anaYourSubtitle}
        </p>
      </div>

      {/* Empty state */}
      {!hasPredictions && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-10 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            No data yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            {t.anaNoHistory}
          </p>
        </div>
      )}

      {hasPredictions && (
        <>
          {/* Summary stat cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <StatCard
              label="Total Predictions"
              value={predictions.length}
              hint="All-time prediction count"
            />
            <StatCard
              label="Irrigation Rate"
              value={`${irrigationRate}%`}
              hint="Percentage requiring irrigation"
              tone={irrigationRate > 60 ? "warning" : "success"}
            />
            <StatCard
              label="Avg Temperature"
              value={`${avgTemp}°C`}
              hint="Average across all predictions"
            />
            <StatCard
              label="Avg Humidity"
              value={`${avgHumidity}%`}
              hint="Average relative humidity"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily trend */}
            <ChartCard
              title={t.anaHistory}
              description={t.anaHistoryDesc}
              type="line"
              data={labels.length > 0 ? trendData : null}
            />

            {/* Crop bar chart */}
            {cropLabels.length > 0 && (
              <ChartCard
                title="Predictions by Crop"
                description="How many predictions were run for each crop type."
                type="bar"
                data={cropChartData}
              />
            )}

            {/* Soil irrigation rate */}
            {soilLabels.length > 0 && (
              <ChartCard
                title="Irrigation Rate by Soil Type"
                description="Percentage of predictions recommending irrigation per soil type."
                type="bar"
                data={soilChartData}
              />
            )}

            {/* Prediction outcome summary */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-1">
                Outcome Breakdown
              </p>
              <p className="mb-4 text-xs text-gray-400 dark:text-slate-500">
                Overall split between irrigation and no-irrigation decisions.
              </p>
              <div className="space-y-3">
                {/* Irrigation bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-600 dark:text-amber-300 font-medium">
                      💧 Irrigation Needed
                    </span>
                    <span className="text-gray-500 dark:text-slate-400">
                      {predictions.filter((p) => p.prediction === 1).length} ({irrigationRate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-700"
                      style={{ width: `${irrigationRate}%` }}
                    />
                  </div>
                </div>
                {/* No irrigation bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                      ✓ No Irrigation
                    </span>
                    <span className="text-gray-500 dark:text-slate-400">
                      {predictions.filter((p) => p.prediction === 0).length} ({100 - irrigationRate}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{ width: `${100 - irrigationRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Per-crop breakdown table */}
              {cropLabels.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-2">
                    By Crop
                  </p>
                  <div className="space-y-1">
                    {cropLabels.map((crop, i) => {
                      const total = cropValues[i];
                      const irrigated = predictions.filter(
                        (p) => p.crop === crop && p.prediction === 1
                      ).length;
                      const pct = Math.round((irrigated / total) * 100);
                      return (
                        <div key={crop} className="flex items-center gap-2 text-xs">
                          <span className="w-16 truncate font-medium text-gray-600 dark:text-slate-400">
                            {crop}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-400 dark:text-slate-500">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AnalyticsPage;
