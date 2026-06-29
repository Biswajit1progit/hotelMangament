import axios from "axios";

// ── In-memory access token ────────────────────────────────────────────────────
// NOT stored in sessionStorage or localStorage.
// Lives only here — wiped on page refresh (initAuth in App.jsx restores it).
let accessToken  = null;
let isRefreshing = false;
let refreshQueue = [];

export const setAccessToken   = (t) => { accessToken = t; };
export const getAccessToken   = ()  => accessToken;
export const clearAccessToken = ()  => { accessToken = null; };

const processQueue = (newToken) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         process.env.REACT_APP_API_URL,
  withCredentials: true,   // sends httpOnly refreshToken cookie on every request
});

// ── Request interceptor: attach in-memory access token ───────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on TOKEN_EXPIRED ────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const code     = error.response?.data?.code;

    if (status === 401 && code === "TOKEN_EXPIRED" && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // Cookie sent automatically — no manual token needed
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        setAccessToken(data.token);
        if (data.user) sessionStorage.setItem("user", JSON.stringify(data.user));

        processQueue(data.token);
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);

      } catch (refreshErr) {
        isRefreshing = false;
        refreshQueue = [];
        clearAccessToken();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;