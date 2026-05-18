 import axios from "axios";

export const addReview = (data) =>
  axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, data);

export const getReviews = (hotelId) =>
  axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/${hotelId}`);