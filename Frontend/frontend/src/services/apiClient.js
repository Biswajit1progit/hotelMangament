import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Automatically attach the token from sessionStorage to every request —
// this replaces what the cookie was doing, using the original, reliably
// working header-based approach instead.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;