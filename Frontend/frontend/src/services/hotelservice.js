 import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/hotels`;

export const searchHotels = async (filters) => {
  const res = await axios.get(`${API}/search`, {
    params: filters, // ✅ VERY IMPORTANT
  });
  return res.data;
};
// 🏨 Get single hotel by ID
export const getHotelById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};
//
export const getHotels = async () => {
  const res = await axios.get(API);
  return res.data;
};

//district Filter Serarch
export const getHotelsByDistrict = async (district) => {
  const res = await axios.get(`${API}?district=${district}`);
  return res.data;
};