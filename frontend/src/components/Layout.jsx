import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const Layout = ({ children }) => {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();

  const navLinkClass = ({ isActive }) => isActive ? "nav-link-active" : "nav-link";

  const farmerLinks = [
    { to: "/farmer",           label: t.sideDashboard,  icon: "🏠" },
    { to: "/farmer/prediction",label: t.sidePrediction, icon: "🌿" },
    { to: "/farmer/analytics", label: t.sideAnalytics,  icon: "📊" },
  ];
  const adminLinks = [
    { to: "/admin",            label: t.sideAdminDashboard,    icon: "⚙️" },
    { to: "/admin/analytics",  label: t.sidePlatformAnalytics, icon: "📈" },
  ];
  const links = role === "admin" ? adminLinks : farmerLinks;

  return (
    <div className="page-container">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-700">
          <img src="/gla-logo.png" alt="GLA University" className="h-12 w-auto mb-3" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #1a4d2e, #2d6a4f)" }}>
              Ag
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-slate-200">AgroCloud</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">{t.appSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            {role === "admin" ? t.sideAdministration : t.sideFarmerPortal}
          </p>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}
              end={link.to === "/farmer" || link.to === "/admin"}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <NavLink to="/profile" className={navLinkClass}>
            <span>👤</span>
            <span>{t.sideProfile}</span>
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #1a4d2e, #2d6a4f)" }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate">
                {user?.email || t.userGuest}
              </p>
              <span className={`text-[10px] font-medium ${role === "admin" ? "text-green-700 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
                {role === "admin" ? t.roleAdmin : t.roleFarmer}
              </span>
            </div>
          </div>
          <button type="button"
            className="w-full rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            onClick={logout}>
            {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Top header bar */}
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-4 shadow-sm transition-colors duration-300">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-800 dark:text-green-400">
              AgroCloud · {t.glaBadgeLine1}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t.heroHeading2} {t.heroBody2}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <img src="/gla-logo.png" alt="GLA University" className="h-9 w-auto" />
            <Link to="/"
              className="rounded-full border border-gray-300 dark:border-slate-600 px-3 py-1 text-xs text-gray-500 dark:text-slate-400 hover:border-green-700 hover:text-green-700 dark:hover:border-green-400 dark:hover:text-green-400 transition">
              {t.backToHome}
            </Link>
          </div>
        </header>

        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
