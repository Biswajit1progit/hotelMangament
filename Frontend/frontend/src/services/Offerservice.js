import api from "./apiClient";

const API = "/api/offers";

// ── Public ──────────────────────────────────────────────────────────────────
export const getOffersForHotel = async (hotelId) => {
  const { data } = await api.get(`${API}/hotel/${hotelId}`);
  return data.offers;
};

// ── Checkout ────────────────────────────────────────────────────────────────
// paymentMethod is optional — pass it only if your checkout UI asks the user
// to pick a payment method before applying the coupon.
export const validateOffer = async ({ code, hotelId, bookingAmount, paymentMethod }) => {
  const { data } = await api.post(`${API}/validate`, {
    code,
    hotelId,
    bookingAmount,
    paymentMethod,
  });
  return data; // { valid, offerId, discount, finalAmount, applicableMethods }
};

// ── Admin ───────────────────────────────────────────────────────────────────
export const getAllOffersAdmin = async () => {
  const { data } = await api.get(`${API}/admin/all`);
  return data.offers;
};

// ── Owner ───────────────────────────────────────────────────────────────────
export const getOwnerOffers = async () => {
  const { data } = await api.get(`${API}/owner/mine`);
  return data.offers;
};

// ── Shared CRUD (role checked server-side) ────────────────────────────────
export const createOffer = async (payload) => {
  const { data } = await api.post(`${API}`, payload);
  return data.offer;
};

export const updateOffer = async (id, payload) => {
  const { data } = await api.put(`${API}/${id}`, payload);
  return data.offer;
};

export const deleteOffer = async (id) => {
  const { data } = await api.delete(`${API}/${id}`);
  return data;
};