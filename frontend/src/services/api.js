import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

// Cognito token extraction helper
const getCognitoToken = () => {
  const clientId = import.meta.env.VITE_AWS_CLIENT_ID;
  if (!clientId) return null;

  const lastUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
  if (!lastUser) return null;

  return localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${lastUser}.accessToken`);
};

api.interceptors.request.use(async (config) => {
  const token = getCognitoToken();
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
export const getLatestSensors       = () => api.get("/sensors/latest");

