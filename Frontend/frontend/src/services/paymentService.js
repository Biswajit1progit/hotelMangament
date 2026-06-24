
import api from "./apiClient";

// ✅ CHANGED — was raw fetch(), now uses the shared `api` instance so the
// auth cookie rides along (needed now that /create-order requires login on
// the backend).
export const createOrder = async (amount) => {
  const res = await api.post("/api/payment/create-order", { amount });
  return res.data;
};

// ✅ CHANGED — same reason, /verify now requires a logged-in user on the backend.
export const verifyPayment = async (data) => {
  const res = await api.post("/api/payment/verify", data);
  return res.data;
};

// ✅ CHANGED — this is the important one, same pattern as getUserBookings.
// Before: getUserPayments(email) hit /api/payment/user/${email} with plain
// fetch, no credentials, backend trusted the email directly — anyone could
// see anyone's payment history (amounts, hotel names) with zero login.
//
// After: no email parameter. Endpoint is /api/payment/user/me, the shared
// `api` instance sends the auth cookie, backend identifies the user from
// the verified token only.
//
// ⚠️ MIGRATION NOTE: drop the email argument at every call site:
//   getUserPayments(user.email)  →  getUserPayments()
export const getUserPayments = async () => {
  const res = await api.get("/api/payment/user/me");
  return res.data;
};

// ✅ CHANGED — was raw fetch() with method:"PUT", now uses shared instance.
// Backend route itself is unchanged (still no verifyToken on /refund/:id —
// noted as a smaller known gap, not fixed today), but this keeps the file
// consistent and ready if you add verifyToken here later.
export const refundPayment = async (paymentId) => {
  const res = await api.put(`/api/payment/refund/${paymentId}`);
  return res.data;
};