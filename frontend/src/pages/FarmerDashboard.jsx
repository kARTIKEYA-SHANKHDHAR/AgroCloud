import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { collection, onSnapshot, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseClient";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "predictions"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = [];
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      docs.sort(
        (a, b) =>
          (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0)
      );
      setPredictions(docs);
    });
    return () => unsub();
  }, [user]);

  const totalPredictions = predictions.length;
  const irrigationNeeded = predictions.filter((p) => p.prediction === 1).length;
  const noIrrigation = totalPredictions - irrigationNeeded;

  const trendCounts = {};
  predictions.forEach((p) => {
    const ts = p.timestamp ? (p.timestamp.toDate?.() || new Date()) : null;
    if (!ts) return;
    const day = ts.toISOString().slice(0, 10);
    if (!trendCounts[day]) {
      trendCounts[day] = { irrigationNeeded: 0, noIrrigation: 0 };
    }
    if (p.prediction === 1) {
      trendCounts[day].irrigationNeeded += 1;
    } else {
      trendCounts[day].noIrrigation += 1;
    }
  });

  const trendLabels = Object.keys(trendCounts).sort();
  const irrigationSeries = trendLabels.map((d) => trendCounts[d].irrigationNeeded);
  const noIrrigationSeries = trendLabels.map((d) => trendCounts[d].noIrrigation);

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: t.dashIrrigationNeeded,
        data: irrigationSeries,
        borderColor: "#1a4d2e",
        backgroundColor: "rgba(26,77,46,0.12)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#1a4d2e"
      },
      {
        label: t.dashWaterSaved,
        data: noIrrigationSeries,
        borderColor: "#c9a227",
        backgroundColor: "rgba(201,162,39,0.12)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#c9a227"
      }
    ]
  };

  const trendOptions = {};

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {t.dashTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t.dashSubtitle}
          </p>
        </div>
      </div>
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

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ChartCard
          title={t.dashDecisionsChart}
          description={t.dashDecisionsDesc}
          type="line"
          data={trendData}
          options={trendOptions}
        />
        <div className="rounded-2xl border border-gray-200 bg-white dark:bg-slate-900 flex flex-col p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-800 dark:text-slate-100">
            {t.dashRecentPreds}
          </p>
          <p className="mb-3 text-xs text-gray-400">
            {t.dashRecentPredsDesc}
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
            {predictions.length === 0 && (
              <p className="text-gray-400 italic">
                {t.dashNoPreds}
              </p>
            )}
            {predictions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div>
                  <p className="font-semibold text-gray-700">
                    {p.crop} – {p.soil}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Temp {p.temperature}°C · Humidity {p.humidity}% · Rainfall{" "}
                    {p.rainfall}mm
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    p.prediction === 1
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboard;
