/**
 * PredictionContext.jsx (AWS SYNCHRONIZED)
 * ──────────────────────────────────────────────────────────────
 * Manages:
 *   • Prediction history synced with AWS DynamoDB
 * ──────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { getPredictionsFromCloud } from "../services/api";

const PredictionContext = createContext(null);

export const PredictionProvider = ({ children }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch History from AWS Cloud ──────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const res = await getPredictionsFromCloud();
      // Ensure numeric types for analytics compatibility
      const sanitized = res.data.map(p => ({
        ...p,
        temperature: parseFloat(p.temperature),
        humidity: parseFloat(p.humidity),
        rainfall: parseFloat(p.rainfall),
        prediction: parseInt(p.prediction)
      }));
      setPredictions(sanitized);
    } catch (err) {
      console.error("Failed to fetch cloud history", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Adds a new prediction to the local state (it's already saved to cloud via the predict API)
  const addPrediction = useCallback((predictionData) => {
    const entry = {
      id: `cloud_${Date.now()}`,
      userId: user?.uid,
      email: user?.email,
      ...predictionData,
      timestamp: new Date().toISOString(),
    };
    setPredictions((prev) => [entry, ...prev].slice(0, 200));
  }, [user]);

  const clearHistory = useCallback(() => {
    setPredictions([]);
    // Note: Cloud delete not implemented to prevent accidental data loss in this version
  }, []);

  return (
    <PredictionContext.Provider value={{ predictions, addPrediction, clearHistory, loading, refreshHistory: fetchHistory }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictions = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error("usePredictions must be used inside PredictionProvider");
  return ctx;
};
