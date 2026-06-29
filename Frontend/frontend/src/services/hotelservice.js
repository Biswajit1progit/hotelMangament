// hotelservice.js
// CHANGED: switched from raw axios to the shared api instance.
// Public routes (search, getById, getAll, getByDistrict) work exactly
// the same — api just adds withCredentials and the Authorization header
// if a token exists in memory. For logged-out users the header is simply
// absent, which is fine since these routes don't require auth.
import api from "./apiClient";

const API = "/api/hotels";

export const searchHotels = async (filters) => {
  const res = await api.get(`${API}/search`, { params: filters });
  return res.data;
};

export const getHotelById = async (id) => {
  const res = await api.get(`${API}/${id}`);
  return res.data;
};

export const getHotels = async () => {
  const res = await api.get(API);
  return res.data;
};

export const getHotelsByDistrict = async (district) => {
  const res = await api.get(`${API}?district=${district}`);
  return res.data;
};