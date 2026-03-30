import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="glass-panel rounded-2xl px-8 py-6 shadow-card">
          <p className="text-sm text-slate-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="glass-panel rounded-2xl px-8 py-6 shadow-card">
          <p className="text-sm text-slate-300">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    const fallback = role === "admin" ? "/admin" : "/farmer";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};
