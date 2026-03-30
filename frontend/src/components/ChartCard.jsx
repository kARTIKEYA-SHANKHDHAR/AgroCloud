import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const ChartCard = ({ title, description, type = "line", data, options }) => {
  const { isDark } = useTheme();

  const textColor     = isDark ? "#94a3b8" : "#6b7280";
  const titleColor    = isDark ? "#86efac" : "#1a4d2e";
  const gridColor     = isDark ? "rgba(51,65,85,0.6)" : "rgba(0,0,0,0.05)";
  const tooltipBg     = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e5e7eb";
  const tooltipTitle  = isDark ? "#86efac" : "#1a4d2e";
  const tooltipBody   = isDark ? "#cbd5e1" : "#374151";

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { size: 11, family: "Inter" },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 10 } },
        grid:  { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { size: 10 } },
        grid:  { color: gridColor },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...(options || {}) };
  const ChartComponent = type === "bar" ? Bar : Line;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${
      isDark
        ? "border-slate-700 bg-slate-900"
        : "border-gray-200 bg-white"
    }`}>
      <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-gray-800"}`}>{title}</p>
      {description && (
        <p className={`mt-0.5 mb-4 text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}>{description}</p>
      )}
      {data ? (
        <ChartComponent data={data} options={mergedOptions} />
      ) : (
        <div className="flex h-32 items-center justify-center">
          <p className={`text-xs animate-pulse-soft ${isDark ? "text-slate-500" : "text-gray-400"}`}>
            Loading chart data...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
