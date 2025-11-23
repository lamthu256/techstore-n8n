import axios, { AxiosInstance } from "axios";

// Định nghĩa base URL từ biến môi trường
const API_BASE_URL =
  "https://theodore-poetastrical-tran.ngrok-free.dev/webhook";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
