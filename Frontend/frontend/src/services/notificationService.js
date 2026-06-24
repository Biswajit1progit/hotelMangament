
import api from "./apiClient";

// ✅ FIXED — removed email from all notification URLs.
// Backend now reads identity from the verified JWT token (req.user),
// so no email parameter is needed or accepted in the URL anymore.
//
// OLD → NEW:
//   GET  /api/notifications/${email}         →  GET  /api/notifications/me
//   PATCH /api/notifications/read-all/${email} →  PATCH /api/notifications/read-all
//
// The api instance (apiClient.js) sends the Authorization header
// automatically via the request interceptor — no changes needed there.

export const getNotifications = async () => {
  const res = await api.get("/api/notifications/me");
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.patch(`/api/notifications/read/${id}`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.patch("/api/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/api/notifications/${id}`);
  return res.data;
};

// checkAvailability — public route, no auth needed, unchanged
export const checkAvailability = async ({ hotelId, checkIn, checkOut, rooms }) => {
  const res = await api.post("/api/bookings/check-availability", {
    hotelId, checkIn, checkOut, rooms,
  });
  return res.data;
};