/**
 * WeatherWidget.jsx
 * Reusable weather card shown on Dashboard and Prediction page.
 * Reads from FarmContext — no props needed.
 */
import React from "react";
import { useFarm } from "../context/FarmContext";

const Stat = ({ icon, label, value, unit }) => (
  <div className="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 px-3 py-2.5 min-w-[72px]">
    <span className="text-base">{icon}</span>
    <span className="text-[11px] text-gray-400 dark:text-slate-500">{label}</span>
    <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
      {value ?? "—"}<span className="text-[10px] font-normal ml-0.5">{unit}</span>
    </span>
  </div>
);

const WeatherWidget = ({ onSetupFarm }) => {
  const { farm, hasFarm, weather, weatherLoading, weatherError, refreshWeather } = useFarm();

  // ── No farm saved yet ────────────────────────────────────────
  if (!hasFarm) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            📍 No farm location saved
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Save your farm location to auto-detect live weather data.
          </p>
        </div>
        <button
          type="button"
          onClick={onSetupFarm}
          className="btn-primary whitespace-nowrap text-xs px-3 py-2"
        >
          Set Farm Location
        </button>
      </div>
    );
  }

  // ── Farm saved — show weather ───────────────────────────────
  const updatedAt = weather?.updatedAt
    ? new Date(weather.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>🌾</span> {farm.farmName || "My Farm"}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            📍 {farm.city || `${farm.latitude?.toFixed(3)}, ${farm.longitude?.toFixed(3)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshWeather}
          disabled={weatherLoading}
          title="Refresh live weather"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600 px-2.5 py-1.5 text-[11px] text-gray-500 dark:text-slate-400 hover:border-green-600 hover:text-green-700 dark:hover:text-green-400 transition disabled:opacity-50"
        >
          {weatherLoading ? (
            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : "↻"} Refresh
        </button>
      </div>

      {/* Error */}
      {weatherError && (
        <p className="mb-2 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-600 dark:text-rose-300">
          ⚠ {weatherError}
        </p>
      )}

      {/* Weather stats */}
      {weatherLoading && !weather ? (
        <div className="flex items-center justify-center py-4 text-xs text-gray-400 dark:text-slate-500">
          <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Fetching live weather…
        </div>
      ) : weather ? (
        <>
          <div className="flex gap-2 flex-wrap">
            <Stat icon="🌡" label="Temperature" value={weather.temperature?.toFixed(1)} unit="°C" />
            <Stat icon="💧" label="Humidity"    value={weather.humidity?.toFixed(0)}    unit="%" />
            <Stat icon="🌧" label="Rainfall"    value={weather.rainfall?.toFixed(1)}    unit="mm" />
            <Stat icon="💨" label="Wind"        value={weather.windspeed?.toFixed(0)}   unit="km/h" />
          </div>
          {updatedAt && (
            <p className="mt-2 text-[10px] text-gray-300 dark:text-slate-600">
              Last updated: {updatedAt} · Farm location data
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">
          Click Refresh to load weather for your farm.
        </p>
      )}
    </div>
  );
};

export default WeatherWidget;
