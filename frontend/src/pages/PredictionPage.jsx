import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { predictIrrigation } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { usePredictions } from "../context/PredictionContext";

const crops = ["Wheat", "Maize", "Rice", "Soybean", "Cotton"];
const soils = ["Loamy", "Sandy", "Clay"];

const PredictionPage = () => {
  const { t } = useLanguage();
  const { addPrediction, predictions } = usePredictions();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    temperature: "",
    humidity: "",
    rainfall: "",
    crop: crops[0],
    soil: soils[0],
  });
  const [result, setResult] = useState(null);   // { result, raw }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        rainfall: Number(form.rainfall),
        crop: form.crop,
        soil: form.soil,
      };
      const res = await predictIrrigation(payload);
      const data = res.data; // { result, raw }

      // Save into shared prediction context (updates Dashboard + Analytics live)
      addPrediction({ ...payload, ...data });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Prediction failed. Check backend connectivity."
      );
    } finally {
      setLoading(false);
    }
  };

  const isIrrigation = result?.raw === 1;

  // Last 5 predictions from context
  const recentPredictions = predictions.slice(0, 5);

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
          {t.predTitle}
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">{t.predSubtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* ── Input form ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
        >
          <p className="mb-4 text-sm font-semibold text-gray-800 dark:text-slate-100">
            {t.predFieldCond}
          </p>

          {/* Numeric inputs */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "temperature", label: t.predTemp },
              { name: "humidity",    label: t.predHumid },
              { name: "rainfall",    label: t.predRain },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                  {label}
                </label>
                <input
                  type="number"
                  name={name}
                  className="input-field"
                  value={form[name]}
                  onChange={handleChange}
                  required
                  step="any"
                />
              </div>
            ))}
          </div>

          {/* Select inputs */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                {t.predCrop}
              </label>
              <select
                name="crop"
                className="input-field"
                value={form.crop}
                onChange={handleChange}
              >
                {crops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                {t.predSoil}
              </label>
              <select
                name="soil"
                className="input-field"
                value={form.soil}
                onChange={handleChange}
              >
                {soils.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary mt-5 w-full justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {t.predRunning}
              </span>
            ) : t.predRunBtn}
          </button>
        </form>

        {/* ── Result panel ── */}
        <div className="flex flex-col gap-4">
          {/* Result card */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
              {t.predResultTitle}
            </p>
            <p className="mb-4 text-xs text-gray-400 dark:text-slate-400">
              {t.predResultDesc}
            </p>

            {result ? (
              <div
                className={`rounded-2xl border px-4 py-5 text-center transition-all duration-300 ${
                  isIrrigation
                    ? "border-amber-400/40 bg-amber-50 dark:bg-amber-500/10"
                    : "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-wide font-semibold ${
                    isIrrigation
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-emerald-600 dark:text-emerald-300"
                  }`}
                >
                  {t.predRecommendation}
                </p>
                <p
                  className={`mt-2 text-lg font-bold ${
                    isIrrigation
                      ? "text-amber-700 dark:text-amber-100"
                      : "text-emerald-700 dark:text-emerald-100"
                  }`}
                >
                  {result.result}
                </p>
                <p className="mt-3 text-[11px] text-gray-400 dark:text-slate-500">
                  Dashboard and Analytics updated ✓
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/farmer")}
                  className="mt-3 rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-1.5 text-xs text-gray-500 dark:text-slate-400 hover:border-green-600 hover:text-green-700 dark:hover:text-green-400 transition"
                >
                  View Dashboard →
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-950/80 px-4 py-5 text-center text-xs text-gray-400 dark:text-slate-400">
                {t.predResultWait}
              </div>
            )}

            <p className="mt-4 text-[11px] text-gray-400 dark:text-slate-500">
              {t.predNote}
            </p>
          </div>

          {/* Recent history mini-panel */}
          {recentPredictions.length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Recent Predictions
              </p>
              <div className="space-y-2">
                {recentPredictions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-gray-700 dark:text-slate-300">
                      {p.crop} · {p.soil}
                      <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
                        {p.temperature}°C {p.humidity}%rh
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.prediction === 1
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                          : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {p.prediction === 1 ? "💧 Irrigate" : "✓ Skip"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PredictionPage;
