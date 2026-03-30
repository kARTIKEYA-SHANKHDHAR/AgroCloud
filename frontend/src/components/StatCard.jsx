import React from "react";

const toneStyles = {
  default: {
    bg: "bg-white dark:bg-slate-900",
    border: "border-gray-200 dark:border-slate-700",
    valueColor: "text-gray-900 dark:text-slate-50",
    dot: "bg-gray-400 dark:bg-slate-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    valueColor: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    valueColor: "text-green-800 dark:text-green-300",
    dot: "bg-green-500",
  },
};

const StatCard = ({ label, value, hint, tone = "default" }) => {
  const s = toneStyles[tone] || toneStyles.default;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${s.bg} ${s.border}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400">
          {label}
        </p>
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      </div>
      <p className={`text-3xl font-bold ${s.valueColor}`}>{value ?? "—"}</p>
      {hint && <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  );
};

export default StatCard;
