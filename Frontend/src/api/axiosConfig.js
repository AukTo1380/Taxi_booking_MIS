import axios from "axios";

// Get the base URL from environment variables, with a fallback for local dev
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
