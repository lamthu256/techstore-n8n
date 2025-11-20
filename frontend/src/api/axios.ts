import axios, { AxiosInstance } from "axios";

// Định nghĩa base URL từ biến môi trường
const API_BASE_URL = "https://backend-n8n-94uk.onrender.com";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động đính kèm Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
