import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../services/AuthContext";

const ProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <Layout>
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-slate-50">Profile</h1>
        <p className="text-xs text-slate-400">
          View account details and environment information.
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <div className="glass-panel rounded-2xl border border-slate-800/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account
            </p>
            <p className="mt-1 text-slate-100">
              {user?.email || "Unknown user"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Role:{" "}
              <span className="font-medium text-primary-300">
                {role === "admin" ? "Admin" : "Farmer"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

