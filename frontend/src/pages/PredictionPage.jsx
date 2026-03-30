import React, { useState } from "react";
import Layout from "../components/Layout";
import { predictIrrigation } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const crops = ["Wheat", "Maize", "Rice", "Soybean", "Cotton"];
const soils = ["Loamy", "Sandy", "Clay"];

const PredictionPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    temperature: "",
    humidity: "",
    rainfall: "",
    crop: crops[0],
    soil: soils[0]
  });
  const [result, setResult] = useState(null);
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
        soil: form.soil
      };
      const res = await predictIrrigation(payload);
      setResult(res.data.result);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Prediction failed. Check backend connectivity."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            {t.predTitle}
          </h1>
          <p className="text-xs text-slate-400">
            {t.predSubtitle}
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl border border-slate-800/80 p-5"
        >
          <p className="mb-4 text-sm font-semibold text-slate-100">
            {t.predFieldCond}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {t.predTemp}
              </label>
              <input
                type="number"
                name="temperature"
                className="input-field"
                value={form.temperature}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {t.predHumid}
              </label>
              <input
                type="number"
                name="humidity"
                className="input-field"
                value={form.humidity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {t.predRain}
              </label>
              <input
                type="number"
                name="rainfall"
                className="input-field"
                value={form.rainfall}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {t.predCrop}
              </label>
              <select
                name="crop"
                className="input-field"
                value={form.crop}
                onChange={handleChange}
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                {t.predSoil}
              </label>
              <select
                name="soil"
                className="input-field"
                value={form.soil}
                onChange={handleChange}
              >
                {soils.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary mt-5 w-full justify-center"
            disabled={loading}
          >
            {loading ? t.predRunning : t.predRunBtn}
          </button>
        </form>

        <div className="glass-panel flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {t.predResultTitle}
            </p>
            <p className="mb-4 text-xs text-slate-400">
              {t.predResultDesc}
            </p>
            {result ? (
              <div className="mt-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center">
                <p className="text-xs uppercase tracking-wide text-emerald-300">
                  {t.predRecommendation}
                </p>
                <p className="mt-2 text-lg font-semibold text-emerald-100">
                  {result}
                </p>
              </div>
            ) : (
              <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-5 text-center text-xs text-slate-400">
                {t.predResultWait}
              </div>
            )}
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            {t.predNote}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PredictionPage;

