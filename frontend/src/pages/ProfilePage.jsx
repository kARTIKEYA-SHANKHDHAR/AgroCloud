import React, { useState } from "react";
import Layout from "../components/Layout";
import FarmSetupModal from "../components/FarmSetupModal";
import { useAuth } from "../services/AuthContext";
import { usePredictions } from "../context/PredictionContext";
import { useFarm } from "../context/FarmContext";

const ProfilePage = () => {
  const { user, role, logout } = useAuth();
  const { predictions, clearHistory } = usePredictions();
  const { farm, hasFarm, clearFarm, weather } = useFarm();
  const [showFarmModal, setShowFarmModal] = useState(false);

  const totalPreds = predictions.length;
  const irrigationCount = predictions.filter((p) => p.prediction === 1).length;
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "—";

  return (
    <Layout>
      <FarmSetupModal open={showFarmModal} onClose={() => setShowFarmModal(false)} />

      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Profile</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
          View your account details and activity summary.
        </p>

        {/* Avatar + identity */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1a4d2e, #2d6a4f)" }}
            >
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-100">
                {user?.email || "Unknown user"}
              </p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                role === "admin"
                  ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                  : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
              }`}>
                {role === "admin" ? "⚙️ Admin" : "🌾 Farmer"}
              </span>
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                Member since {joinedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Activity summary */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm mb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Activity Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 dark:bg-slate-800/60 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{totalPreds}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Total Predictions</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{irrigationCount}</p>
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">Irrigation Needed</p>
            </div>
          </div>
        </div>

        {/* ── Farm Location Section ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              🌾 Farm Location
            </p>
            <button
              type="button"
              onClick={() => setShowFarmModal(true)}
              className="text-xs text-green-700 dark:text-green-400 font-semibold hover:underline"
            >
              {hasFarm ? "Edit Farm" : "+ Set Farm Location"}
            </button>
          </div>

          {hasFarm ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Farm Name</span>
                <span className="font-medium text-gray-800 dark:text-slate-200">{farm.farmName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Location</span>
                <span className="font-medium text-gray-800 dark:text-slate-200">{farm.city || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Coordinates</span>
                <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
                  {farm.latitude?.toFixed(4)}, {farm.longitude?.toFixed(4)}
                </span>
              </div>
              {weather && (
                <div className="mt-2 rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2 flex gap-4 text-xs font-medium text-green-800 dark:text-green-300">
                  <span>🌡 {weather.temperature?.toFixed(1)}°C</span>
                  <span>💧 {weather.humidity?.toFixed(0)}%</span>
                  <span>🌧 {weather.rainfall?.toFixed(1)}mm</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] mt-1">
                <span className="text-gray-400 dark:text-slate-500">Saved on</span>
                <span className="text-gray-400 dark:text-slate-500">
                  {farm.updatedAt ? new Date(farm.updatedAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500">
              No farm location saved. Set your farm location to enable automatic weather detection for predictions.
            </p>
          )}
        </div>

        {/* Account details */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm mb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Account Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Email</span>
              <span className="text-gray-800 dark:text-slate-200 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">User ID</span>
              <span className="text-gray-400 dark:text-slate-500 text-xs font-mono">
                {user?.uid?.slice(0, 16)}…
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Role</span>
              <span className="text-gray-800 dark:text-slate-200 font-medium capitalize">{role}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-100 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10 p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
            Danger Zone
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={clearHistory}
              className="w-full rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition text-left"
            >
              🗑️ Clear prediction history ({totalPreds} records)
            </button>
            {hasFarm && (
              <button
                type="button"
                onClick={clearFarm}
                className="w-full rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition text-left"
              >
                📍 Remove saved farm location
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition text-left"
            >
              → Log out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
