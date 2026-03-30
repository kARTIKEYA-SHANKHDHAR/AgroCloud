import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import {
  fetchAdminOverview,
  fetchPredictionTrends,
  fetchCropStats,
  fetchAdminUsers,
  updateUserStatus,
  uploadDataset,
  triggerRetrain
} from "../services/api";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState(null);
  const [crops, setCrops] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datasetFile, setDatasetFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, tr, cr, us] = await Promise.all([
          fetchAdminOverview(),
          fetchPredictionTrends(),
          fetchCropStats(),
          fetchAdminUsers()
        ]);
        setOverview(ov.data);
        setTrend(tr.data);
        setCrops(cr.data);
        setUsers(us.data.users || []);
      } catch (e) {
        setMessage("Failed to load admin data. Check backend connectivity.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleUser = async (userId, active) => {
    try {
      await updateUserStatus(userId, !active);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, active: !active } : u
        )
      );
    } catch {
      setMessage("Failed to update user state.");
    }
  };

  const handleDatasetUpload = async (e) => {
    e.preventDefault();
    if (!datasetFile) return;
    try {
      await uploadDataset(datasetFile);
      setMessage("Dataset uploaded. You can now retrain the model.");
      setDatasetFile(null);
    } catch {
      setMessage("Failed to upload dataset.");
    }
  };

  const handleRetrain = async () => {
    try {
      const res = await triggerRetrain();
      setMessage(res.data.message || "Model retrained.");
    } catch {
      setMessage("Failed to retrain model. Check backend logs.");
    }
  };

  const trendData = trend
    ? {
        labels: trend.labels,
        datasets: [
          {
            label: "Irrigation Needed",
            data: trend.irrigationNeeded,
            borderColor: "#1a4d2e",
            backgroundColor: "rgba(26,77,46,0.12)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#1a4d2e"
          },
          {
            label: "No Irrigation Needed",
            data: trend.noIrrigationNeeded,
            borderColor: "#c9a227",
            backgroundColor: "rgba(201,162,39,0.12)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#c9a227"
          }
        ]
      }
    : null;

  const cropData = crops
    ? {
        labels: crops.labels,
        datasets: [
          {
            label: "Irrigation decisions per crop",
            data: crops.values,
            backgroundColor: "rgba(26,77,46,0.7)",
            borderColor: "#1a4d2e",
            borderRadius: 6
          }
        ]
      }
    : null;

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Platform-wide irrigation usage, user management and ML lifecycle.
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-400 animate-pulse-soft">
          Loading platform analytics from backend...
        </p>
      )}

      {message && (
        <p className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          {message}
        </p>
      )}

      {overview && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total farmers"
            value={overview.totalFarmers}
            hint="Active farmer accounts in the platform."
          />
          <StatCard
            label="Total predictions"
            value={overview.totalPredictions}
            hint="All irrigation calls made so far."
          />
          <StatCard
            label="Irrigation needed"
            value={overview.irrigationNeeded}
            hint="Times water was recommended."
            tone="warning"
          />
          <StatCard
            label="No irrigation"
            value={overview.noIrrigationNeeded}
            hint="Times irrigation could be skipped."
            tone="success"
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {trendData && (
          <ChartCard
            title="Platform irrigation decisions"
            description="Daily irrigation recommendations across all farmers."
            type="line"
            data={trendData}
          />
        )}
        {cropData && (
          <ChartCard
            title="Crop irrigation patterns"
            description="How often irrigation is needed per crop."
            type="bar"
            data={cropData}
          />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-gray-800">
            User management
          </p>
          <p className="mb-3 text-xs text-gray-400">
            View farmers and toggle activation for access control.
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div>
                  <p className="font-semibold text-gray-700">{u.email}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Role: {u.role || "farmer"}
                  </p>
                </div>
                <button
                  type="button"
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    u.active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  onClick={() => handleToggleUser(u.id, u.active)}
                >
                  {u.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-400 italic">No user records found yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-gray-800">
            Dataset &amp; model lifecycle
          </p>
          <p className="mb-3 text-xs text-gray-400">
            Upload a new irrigation dataset and trigger model retraining.
          </p>
          <form
            onSubmit={handleDatasetUpload}
            className="space-y-3 text-xs text-gray-700"
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setDatasetFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gla-green file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:opacity-90"
            />
            <button
              type="submit"
              className="btn-secondary w-full justify-center"
              disabled={!datasetFile}
            >
              Upload dataset
            </button>
          </form>
          <button
            type="button"
            onClick={handleRetrain}
            className="btn-primary mt-3 w-full justify-center"
          >
            Retrain model
          </button>
          <p className="mt-3 text-[11px] text-gray-400">
            Backend uses the uploaded CSV to retrain the Random Forest model and
            refreshes predictions instantly.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

