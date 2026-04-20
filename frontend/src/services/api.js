import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

// Cognito stores the access token in localStorage automatically.
// Key format: CognitoIdentityServiceProvider.<clientId>.<username>.accessToken
api.interceptors.request.use(async (config) => {
  const storageKeys = Object.keys(localStorage);
  const accessTokenKey = storageKeys.find(key => key.endsWith(".accessToken"));
  const token = accessTokenKey ? localStorage.getItem(accessTokenKey) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Prediction ──────────────────────────────────────────────
export const predictIrrigation = (payload) => api.post("/predict", payload);

// ── Admin ────────────────────────────────────────────────────
export const fetchAdminOverview    = () => api.get("/stats/overview");
export const fetchPredictionTrends = () => api.get("/stats/predictions");
export const fetchCropStats        = () => api.get("/stats/crops");
export const fetchAdminUsers       = () => api.get("/admin/users");
export const updateUserStatus      = (userId, active) => api.patch(`/admin/users/${userId}`, { active });

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/dataset/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const triggerRetrain = () => api.post("/admin/model/retrain");

// ── AWS Cloud Storage Endpoints ──────────────────────────────
export const saveFarmToCloud       = (farmData) => api.post("/user/farm", farmData);
export const getFarmFromCloud      = () => api.get("/user/farm");
export const getPredictionsFromCloud = () => api.get("/predictions");

