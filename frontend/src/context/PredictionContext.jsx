import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "../services/AuthContext";

const PredictionContext = createContext(null);

const STORAGE_KEY = (uid) => `agrocloud_predictions_${uid}`;

export const PredictionProvider = ({ children }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);

  // Load from localStorage when user changes
  useEffect(() => {
    if (!user?.uid) {
      setPredictions([]);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY(user.uid));
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any corrupt records from old test runs
        const clean = parsed.filter(
          (p) =>
            isFinite(Number(p.temperature)) &&
            isFinite(Number(p.humidity)) &&
            isFinite(Number(p.rainfall)) &&
            Number(p.temperature) < 100 &&   // realistic temperature range
            Number(p.humidity) <= 100          // humidity can't exceed 100%
        );
        setPredictions(clean);
      } else {
        setPredictions([]);
      }
    } catch {
      setPredictions([]);
    }
  }, [user?.uid]);

  // Persist to localStorage on every change
  useEffect(() => {
    if (!user?.uid) return;
    try {
      localStorage.setItem(STORAGE_KEY(user.uid), JSON.stringify(predictions));
    } catch {
      // storage full – ignore
    }
  }, [predictions, user?.uid]);

  const addPrediction = useCallback((predictionData) => {
    const temp     = parseFloat(predictionData.temperature);
    const humidity = parseFloat(predictionData.humidity);
    const rainfall = parseFloat(predictionData.rainfall);

    // Reject corrupt / non-numeric data
    if (!isFinite(temp) || !isFinite(humidity) || !isFinite(rainfall)) return;

    const entry = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId: user?.uid,
      email: user?.email,
      temperature: temp,
      humidity: humidity,
      rainfall: rainfall,
      crop: predictionData.crop,
      soil: predictionData.soil,
      prediction: predictionData.raw,            // 0 or 1
      label: predictionData.result,              // "Irrigation Needed" / "No Irrigation Needed"
      timestamp: new Date().toISOString(),       // ISO string for easy sorting
    };
    setPredictions((prev) => [entry, ...prev].slice(0, 200)); // keep last 200
  }, [user]);

  const clearHistory = useCallback(() => {
    setPredictions([]);
    if (user?.uid) {
      localStorage.removeItem(STORAGE_KEY(user.uid));
    }
  }, [user?.uid]);

  return (
    <PredictionContext.Provider value={{ predictions, addPrediction, clearHistory }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictions = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error("usePredictions must be used inside PredictionProvider");
  return ctx;
};
