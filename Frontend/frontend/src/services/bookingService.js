/* export  const createBooking = async (bookingData) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  return res.json();
};

export const getUserBookings = async (email) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/user/${email}`);
  return res.json();
}; */
import api from "./apiClient";

// ✅ CHANGED — was raw fetch() with no credentials at all, meaning no
// cookie/token was ever sent. createBooking itself doesn't strictly need
// auth to function (your backend doesn't check req.user here), but it's
// switched to the shared `api` instance for consistency and so it
// automatically benefits from baseURL + credentials if you add auth here later.
export const createBooking = async (bookingData) => {
  const res = await api.post("/api/bookings", bookingData);
  return res.data;
};

// ✅ CHANGED — this is the important one.
// Before: getUserBookings(email) hit /api/bookings/user/${email} with plain
// fetch, no credentials, and the backend trusted that email directly —
// meaning anyone could view anyone's bookings by passing any email string.
//
// After: no email parameter at all. The endpoint is now /api/bookings/user/me,
// and `api` (the shared instance) sends the auth cookie automatically via
// withCredentials. The backend identifies "which user" purely from the
// verified token — there is nothing left here for a caller to spoof.
//
// ⚠️ MIGRATION NOTE: any component currently calling
// `getUserBookings(currentUserEmail)` needs that argument REMOVED —
// search your codebase for getUserBookings( and drop the email argument
// at each call site, e.g.:
//   getUserBookings(user.email)  →  getUserBookings()
export const getUserBookings = async () => {
  const res = await api.get("/api/bookings/user/me");
  return res.data;
};