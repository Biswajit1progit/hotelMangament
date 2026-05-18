import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/notifications`;

// ✅ Get all notifications for logged-in user
export const getNotifications = async (email) => {
  const res = await axios.get(`${API}/${email}`);
  return res.data;
};

// ✅ Mark one notification as read
export const markAsRead = async (id) => {
  const res = await axios.patch(`${API}/read/${id}`);
  return res.data;
};

// ✅ Mark all as read
export const markAllAsRead = async (email) => {
  const res = await axios.patch(`${API}/read-all/${email}`);
  return res.data;
};

// ✅ Delete one notification
export const deleteNotification = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};

// ✅ Check hotel availability for date range
export const checkAvailability = async ({ hotelId, checkIn, checkOut, rooms }) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/bookings/check-availability`,
    { hotelId, checkIn, checkOut, rooms }
  );
  return res.data;
};