import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="glass-panel max-w-md rounded-3xl border border-slate-800/80 px-8 py-8 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-50">
          Page not found
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          The page you are looking for does not exist. Use the dashboards or go
          back to the landing page.
        </p>
        <div className="mt-5 flex flex-col gap-2 text-sm">
          <Link to="/" className="btn-primary justify-center">
            Go to landing
          </Link>
          <Link to="/login" className="btn-secondary justify-center">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

