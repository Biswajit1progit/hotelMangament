import api from "./apiClient";
import { setUserSession, getToken } from "../utils/auth";

export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

// loginUser — setUserSession now stores user in sessionStorage
// AND sets access token in memory (no longer writes to sessionStorage("token"))
export const loginUser = async (data) => {
  const res = await api.post("/api/auth/login", data);
  setUserSession(res.data.user, res.data.token);
  return res.data;
};

export const googleAuthUser = async (data) => {
  const res = await api.post("/api/auth/google", data);
  setUserSession(res.data.user, res.data.token);
  return res.data;
};

export const logoutRequest = async () => {
  const res = await api.post("/api/auth/logout", {});
  return res.data;
};

// Wishlist — Authorization header removed, apiClient interceptor handles it
export const toggleWishlist = async (hotelId) => {
  const res = await api.post(`/api/auth/wishlist/${hotelId}`, {});
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get("/api/auth/wishlist");
  return res.data;
};