import axios from "axios";
import { auth } from "../firebase/firebaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const predictIrrigation = (payload) => api.post("/predict", payload);

export const fetchAdminOverview = () => api.get("/stats/overview");

export const fetchPredictionTrends = () => api.get("/stats/predictions");

export const fetchCropStats = () => api.get("/stats/crops");

export const fetchAdminUsers = () => api.get("/admin/users");

export const updateUserStatus = (userId, active) =>
  api.patch(`/admin/users/${userId}`, { active });

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/dataset/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const triggerRetrain = () => api.post("/admin/model/retrain");

