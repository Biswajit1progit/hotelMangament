 import axios from "axios";
import { setUserSession } from "../utils/auth";
import { getToken } from "../utils/auth";
 const API = `${process.env.REACT_APP_API_URL}/api/auth`;

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
};
/* export const loginUser = async (data) => {
  const res = await axios.post(
    `${API}/login`,
    data
  ); */
  /* 
  setUserSession(res.data.user, res.data.token);

  return res.data;
}; */
export const loginUser = async (data) => {
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
};