import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("securevote_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || { message: "Network error" })
);

export const mediaUrl = (path) => (path ? `${UPLOAD_BASE_URL}${path}` : "");

export default api;
