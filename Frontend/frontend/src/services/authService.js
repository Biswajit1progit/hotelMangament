/*  import axios from "axios";
import { setUserSession } from "../utils/auth";
import { getToken } from "../utils/auth";
 const API = `${process.env.REACT_APP_API_URL}/api/auth`;

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
}; */
/* export const loginUser = async (data) => {
  const res = await axios.post(
    `${API}/login`,
    data
  ); */
  /* 
  setUserSession(res.data.user, res.data.token);

  return res.data;
}; */
/* xport const loginUser = async (data) => {
  const res = await axios.post(`${API}/login`, data);

  // store in session
  setUserSession(res.data.user, res.data.token);

  return res.data;
};



export const toggleWishlist = async (hotelId) => {
  const res = await axios.post(
    `${API}/wishlist/${hotelId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
  return res.data;
};

export const getWishlist = async () => {
  const res = await axios.get(`${API}/wishlist`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  return res.data;
}; */

import api from "./apiClient";
import { setUserSession, getToken } from "../utils/auth";

// ✅ CHANGED — all calls now go through the shared `api` instance instead
// of raw axios + manual withCredentials/baseURL on each call. Behavior is
// identical to what we set up earlier today; this is just the consistent
// version once apiClient.js exists.

export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

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

// toggleWishlist / getWishlist — Authorization header left in deliberately.
// Backend's extractToken() checks cookie FIRST, header SECOND, so this still
// works during the transition; safe to remove once you're confident the
// cookie path is solid everywhere.
export const toggleWishlist = async (hotelId) => {
  const res = await api.post(`/api/auth/wishlist/${hotelId}`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const getWishlist = async () => {
  const res = await api.get("/api/auth/wishlist", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};