/**
 * FarmContext.jsx (AWS SYNCHRONIZED)
 * ──────────────────────────────────────────────────────────────
 * Manages:
 *   • Farm location synced with AWS DynamoDB
 *   • Live weather data from Open-Meteo
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
import { saveFarmToCloud, getFarmFromCloud } from "../services/api";

const FarmContext = createContext(null);

const DEFAULT_FARM = {
  farmName: "",
  latitude: null,
  longitude: null,
  city: "",
};

export const FarmProvider = ({ children }) => {
  const { user } = useAuth();

  const [farm, setFarm] = useState(DEFAULT_FARM);
  const [farmLoaded, setFarmLoaded] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // ── Sync with AWS Cloud on Load ──────────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      setFarm(DEFAULT_FARM);
      setFarmLoaded(false);
      return;
    }

    const loadCloudData = async () => {
      try {
        const res = await getFarmFromCloud();
        if (res.data && res.data.latitude) {
          setFarm({
            farmName: res.data.farm_name,
            latitude: parseFloat(res.data.latitude),
            longitude: parseFloat(res.data.longitude),
            city: res.data.city,
          });
        }
      } catch (err) {
        console.error("Cloud sync failed, using local fallback", err);
      } finally {
        setFarmLoaded(true);
      }
    };

    loadCloudData();
  }, [user?.uid]);

  // ── Fetch Weather ──────────────────────────────────────────
  const fetchWeather = useCallback(async (lat, lon) => {
    if (!lat || !lon) return;
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=precipitation_sum&forecast_days=1&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      setWeather({
        temperature: parseFloat(data.current_weather?.temperature ?? 0),
        humidity: parseFloat(data.hourly?.relativehumidity_2m?.[0] ?? 0),
        rainfall: parseFloat(data.daily?.precipitation_sum?.[0] ?? 0),
        windspeed: parseFloat(data.current_weather?.windspeed ?? 0),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setWeatherError("Weather fetch failed.");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (farm.latitude && farm.longitude) {
      fetchWeather(farm.latitude, farm.longitude);
    }
  }, [farm.latitude, farm.longitude, fetchWeather]);

  // ── Save Farm (Local + Cloud) ─────────────────────────────
  const saveFarm = useCallback(
    async (farmData) => {
      if (!user?.uid) return;
      
      // Update locally first for speed (Optimistic Update)
      setFarm(farmData);
      
      try {
        // Save to AWS DynamoDB
        await saveFarmToCloud(farmData);
      } catch (err) {
        console.error("Failed to save to cloud", err);
      }
    },
    [user?.uid]
  );

  const clearFarm = useCallback(() => {
    setFarm(DEFAULT_FARM);
    setWeather(null);
  }, []);

  const detectLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("No GPS"));
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        (err) => reject(new Error(err.message))
      );
    });

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      return data.address?.village || data.address?.city || "Field Location";
    } catch {
      return "Field Location";
    }
  };

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
        refreshWeather: () => fetchWeather(farm.latitude, farm.longitude),
        hasFarm: Boolean(farm.latitude && farm.longitude),
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);
