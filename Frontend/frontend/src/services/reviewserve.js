/*  import axios from "axios";

export const addReview = (data) =>
  axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, data);

export const getReviews = (hotelId) =>
  axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/${hotelId}`); */
import api from "./apiClient";

// ⚠️ NOTE — addReview should probably know WHO is posting via req.user
// (so you can't spoof someone else's name on a review), and your backend
// controller would need to actually use that instead of trusting whatever
// name/email is in the request body. Not changed today since it's a lower
// severity than the bookings/payments data leak (this is "could post under
// a fake name" rather than "could view someone else's private data") —
// flagging as a good next pass once today's priority items are done.

export const addReview = (data) =>
  api.post("/api/reviews", data);

export const getReviews = (hotelId) =>
  api.get(`/api/reviews/${hotelId}`);