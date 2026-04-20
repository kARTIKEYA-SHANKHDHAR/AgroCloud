/**
 * FarmSetupModal.jsx
 * ──────────────────────────────────────────────────────────────
 * Modal dialog for:
 *   - Setting farm name
 *   - Auto-detecting location via browser geolocation
 *   - Manual lat/lon entry as fallback
 * Saves to FarmContext (→ localStorage)
 * ──────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";

const FarmSetupModal = ({ open, onClose }) => {
  const { farm, saveFarm, detectLocation, reverseGeocode } = useFarm();

  const [farmName,  setFarmName]  = useState(farm.farmName  || "");
  const [latitude,  setLatitude]  = useState(farm.latitude  ?? "");
  const [longitude, setLongitude] = useState(farm.longitude ?? "");
  const [city,      setCity]      = useState(farm.city      || "");
  const [detecting, setDetecting] = useState(false);
  const [geoError,  setGeoError]  = useState("");
  const [saving,    setSaving]    = useState(false);

  // Sync fields when modal opens with existing farm data
  useEffect(() => {
    if (open) {
      setFarmName(farm.farmName  || "");
      setLatitude(farm.latitude  ?? "");
      setLongitude(farm.longitude ?? "");
      setCity(farm.city          || "");
      setGeoError("");
    }
  }, [open, farm]);

  if (!open) return null;

  // ── Auto-detect device location ──────────────────────────────
  const handleDetect = async () => {
    setDetecting(true);
    setGeoError("");
    try {
      const { latitude: lat, longitude: lon } = await detectLocation();
      setLatitude(lat.toFixed(6));
      setLongitude(lon.toFixed(6));
      // Reverse geocode to get city name
      const cityName = await reverseGeocode(lat, lon);
      setCity(cityName);
    } catch (err) {
      setGeoError(err.message || "Location detection failed.");
    } finally {
      setDetecting(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!latitude || !longitude) {
      setGeoError("Please provide latitude and longitude.");
      return;
    }
    setSaving(true);
    // If city is empty, try geocoding
    let resolvedCity = city;
    if (!resolvedCity) {
      resolvedCity = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
    }
    saveFarm({
      farmName: farmName.trim() || "My Farm",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city: resolvedCity,
    });
    setSaving(false);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="w-full max-w-md mx-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
              🌾 Set Farm Location
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              We'll use this to auto-fetch live weather for predictions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 dark:border-slate-700 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
          >✕</button>
        </div>

        {/* Farm name */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
            Farm Name
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Ravi's Farm, North Field…"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            maxLength={60}
          />
        </div>

        {/* Auto-detect button */}
        <button
          type="button"
          onClick={handleDetect}
          disabled={detecting}
          className="mb-3 w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {detecting ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Detecting your location…
            </>
          ) : (
            <>📍 Auto-Detect My Current Location</>
          )}
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700"/>
          <span className="text-[11px] text-gray-400 dark:text-slate-500">or enter manually</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-slate-700"/>
        </div>

        {/* Manual lat/lon */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              className="input-field"
              placeholder="e.g. 27.4924"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              className="input-field"
              placeholder="e.g. 77.6737"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

        {/* City (optional override) */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
            Village / City <span className="text-gray-400">(auto-filled)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Auto-detected from coordinates"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Error */}
        {geoError && (
          <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
            ⚠ {geoError}
          </p>
        )}

        {/* Info note */}
        <p className="mb-4 text-[11px] text-gray-400 dark:text-slate-500">
          ℹ Predictions will always use your <strong>saved farm coordinates</strong>, not your current device location — so weather is always accurate for your farm.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !latitude || !longitude}
            className="btn-primary flex-1"
          >
            {saving ? "Saving…" : "Save Farm Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmSetupModal;
