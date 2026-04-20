import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../services/AuthContext";
import { usePredictions } from "../context/PredictionContext";

const ProfilePage = () => {
  const { user, role, logout } = useAuth();
  const { predictions, clearHistory } = usePredictions();

  const totalPreds = predictions.length;
  const irrigationCount = predictions.filter((p) => p.prediction === 1).length;
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "—";

  return (
    <Layout>
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
          Profile
        </h1>
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
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  role === "admin"
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                    : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                }`}
              >
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
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {totalPreds}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Total Predictions
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {irrigationCount}
              </p>
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">
                Irrigation Needed
              </p>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm mb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Account Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Email</span>
              <span className="text-gray-800 dark:text-slate-200 font-medium">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">User ID</span>
              <span className="text-gray-400 dark:text-slate-500 text-xs font-mono">
                {user?.uid?.slice(0, 16)}…
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Role</span>
              <span className="text-gray-800 dark:text-slate-200 font-medium capitalize">
                {role}
              </span>
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
