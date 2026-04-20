/**
 * FarmContext.jsx
 * ──────────────────────────────────────────────────────────────
 * Manages:
 *   • Saved farm location  (localStorage, per-user)
 *   • Live weather data    (Open-Meteo — free, no API key)
 *
 * Open-Meteo docs: https://open-meteo.com/en/docs
 * Endpoint: https://api.open-meteo.com/v1/forecast
 * Fields used: temperature_2m, relativehumidity_2m, precipitation_sum
 * ──────────────────────────────────────────────────────────────
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "../services/AuthContext";

// ── Storage helpers ───────────────────────────────────────────
const FARM_KEY = (uid) => `agrocloud_farm_${uid}`;

// ── Default shape of a farm record ───────────────────────────
const DEFAULT_FARM = {
  farmName: "",
  latitude: null,
  longitude: null,
  city: "",
  createdAt: null,
  updatedAt: null,
};

// ── Context ───────────────────────────────────────────────────
const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
  const { user } = useAuth();

  // Farm location state
  const [farm, setFarm]           = useState(DEFAULT_FARM);
  const [farmLoaded, setFarmLoaded] = useState(false);

  // Weather state
  const [weather, setWeather]         = useState(null);  // { temperature, humidity, rainfall, updatedAt }
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError]     = useState("");

  // ── Load farm from localStorage ────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setFarm(DEFAULT_FARM);
      setFarmLoaded(false);
      setWeather(null);
      return;
    }
    try {
      const saved = localStorage.getItem(FARM_KEY(user.uid));
      if (saved) {
        setFarm(JSON.parse(saved));
      } else {
        setFarm(DEFAULT_FARM);
      }
    } catch {
      setFarm(DEFAULT_FARM);
    }
    setFarmLoaded(true);
  }, [user?.uid]);

  // ── Auto-fetch weather whenever farm coordinates change ────
  useEffect(() => {
    if (farm.latitude && farm.longitude) {
      fetchWeather(farm.latitude, farm.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.latitude, farm.longitude]);

  // ── Fetch live weather from Open-Meteo (free, no API key) ──
  const fetchWeather = useCallback(async (lat, lon) => {
    if (!lat || !lon) return;
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude",  lat);
      url.searchParams.set("longitude", lon);
      // Current conditions
      url.searchParams.set("current_weather", "true");
      // Hourly humidity at hour 0
      url.searchParams.set("hourly", "relativehumidity_2m");
      // Daily precipitation sum
      url.searchParams.set("daily", "precipitation_sum");
      url.searchParams.set("forecast_days", "1");
      url.searchParams.set("timezone", "auto");

      const res  = await fetch(url.toString());
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
      const data = await res.json();

      const temperature = parseFloat(data.current_weather?.temperature ?? 0);
      // Use first hourly humidity reading of the day
      const humidity    = parseFloat(data.hourly?.relativehumidity_2m?.[0] ?? 0);
      // Today's total rainfall in mm
      const rainfall    = parseFloat(data.daily?.precipitation_sum?.[0] ?? 0);

      setWeather({
        temperature,
        humidity,
        rainfall,
        windspeed: parseFloat(data.current_weather?.windspeed ?? 0),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setWeatherError(err.message || "Failed to fetch weather data.");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // ── Refresh weather manually ────────────────────────────────
  const refreshWeather = useCallback(() => {
    if (farm.latitude && farm.longitude) {
      fetchWeather(farm.latitude, farm.longitude);
    }
  }, [farm.latitude, farm.longitude, fetchWeather]);

  // ── Save / update farm location ────────────────────────────
  const saveFarm = useCallback(
    (farmData) => {
      if (!user?.uid) return;
      const now = new Date().toISOString();
      const updated = {
        ...DEFAULT_FARM,
        ...farmData,
        updatedAt: now,
        createdAt: farm.createdAt || now,
      };
      setFarm(updated);
      try {
        localStorage.setItem(FARM_KEY(user.uid), JSON.stringify(updated));
      } catch {
        // storage full
      }
    },
    [user?.uid, farm.createdAt]
  );

  // ── Clear farm location ─────────────────────────────────────
  const clearFarm = useCallback(() => {
    if (!user?.uid) return;
    setFarm(DEFAULT_FARM);
    setWeather(null);
    localStorage.removeItem(FARM_KEY(user.uid));
  }, [user?.uid]);

  // ── Detect current device location (one-shot) ──────────────
  const detectLocation = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported by this browser."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            resolve({ latitude: coords.latitude, longitude: coords.longitude }),
          (err) => reject(new Error(err.message))
        );
      }),
    []
  );

  // ── Reverse geocode lat/lon → city name ────────────────────
  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      return (
        data.address?.village ||
        data.address?.town ||
        data.address?.city ||
        data.address?.county ||
        "Unknown location"
      );
    } catch {
      return "Unknown location";
    }
  }, []);

  return (
    <FarmContext.Provider
      value={{
        farm,
        farmLoaded,
        saveFarm,
        clearFarm,
        detectLocation,
        reverseGeocode,
        weather,
        weatherLoading,
        weatherError,
        refreshWeather,
        hasFarm: Boolean(farm.latitude && farm.longitude),
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used inside FarmProvider");
  return ctx;
};
