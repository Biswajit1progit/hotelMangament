import api from "./apiClient";

// All routes now require verifyToken on backend.
// api instance sends Authorization header automatically — no manual header needed.

// GET reviews for a hotel (requires login)
export const getReviews = (hotelId) =>
  api.get(`/api/reviews/${hotelId}`);

// POST add a review — only send content fields, NOT name/email/userId
// backend reads identity from req.user (JWT) so it cannot be spoofed
export const addReview = (data) =>
  api.post("/api/reviews", data);
  // data shape: { hotelId, rating, text }

// PUT edit a review — only send fields to update
export const editReview = (reviewId, data) =>
  api.put(`/api/reviews/${reviewId}`, data);
  // data shape: { rating, text }

// DELETE a review
export const deleteReview = (reviewId) =>
  api.delete(`/api/reviews/${reviewId}`);