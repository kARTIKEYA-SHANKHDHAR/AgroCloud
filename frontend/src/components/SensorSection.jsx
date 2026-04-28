import React, { useState, useEffect } from "react";
import { getLatestSensors } from "../services/api";

const SensorSection = () => {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLatestSensors();
        setSensors(res.data);
      } catch (err) {
        console.error("Failed to fetch sensor data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !sensors) return (
    <div className="mb-6 p-10 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 text-center">
      <p className="text-sm text-gray-400">Connecting to AWS IoT Core...</p>
    </div>
  );

  const readings = [
    { label: "Soil Moisture", value: `${sensors?.moisture || 0}%`, icon: "💧" },
    { label: "Temperature", value: `${sensors?.temperature || 0}°C`, icon: "🌡️" },
    { label: "Humidity", value: `${sensors?.humidity || 0}%`, icon: "☁️" },
    { label: "Water Level", value: `${sensors?.water_level || 0}%`, icon: "🌊" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live AWS IoT Sensors
        </h2>
        {sensors?.alerts?.length > 0 && (
          <div className="animate-bounce flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">
            ⚠️ {sensors.alerts[0]}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {readings.map((r, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{r.icon}</div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest font-bold">
              {r.label}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-1">
              {r.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorSection;
