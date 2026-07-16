import api from "./apiClient";

const MOVIES = "/api/movies";
const BOOKINGS = "/api/movie-bookings";

// ── Public: movies ────────────────────────────────────────────────────────
export const getMovies = async (search = "") => {
  const { data } = await api.get(MOVIES, { params: search ? { search } : {} });
  return data.movies;
};

export const getMovieById = async (id) => {
  const { data } = await api.get(`${MOVIES}/${id}`);
  return data;
};

// ── Public: theaters ──────────────────────────────────────────────────────
export const getTheaters = async (city = "") => {
  const { data } = await api.get(`${MOVIES}/theaters/list`, { params: city ? { city } : {} });
  return data.theaters;
};

// ── Public: shows ─────────────────────────────────────────────────────────
export const getShowsForMovie = async (movieId, { city, date } = {}) => {
  const { data } = await api.get(`${MOVIES}/${movieId}/shows`, { params: { city, date } });
  return data.shows;
};

export const getShowById = async (showId) => {
  const { data } = await api.get(`${MOVIES}/shows/${showId}`);
  return data.show;
};

// ── Admin: TMDB search + import ──────────────────────────────────────────
export const searchTmdb = async (query, page = 1) => {
  const { data } = await api.get(`${MOVIES}/tmdb/search`, { params: { query, page } });
  return data;
};

export const importMovie = async (tmdbId) => {
  const { data } = await api.post(`${MOVIES}/import`, { tmdbId });
  return data.movie;
};

export const setMovieActive = async (id, isActive) => {
  const { data } = await api.patch(`${MOVIES}/${id}/active`, { isActive });
  return data.movie;
};

// ── Admin: theaters ───────────────────────────────────────────────────────
export const createTheater = async (payload) => {
  const { data } = await api.post(`${MOVIES}/theaters`, payload);
  return data.theater;
};

export const updateTheater = async (id, payload) => {
  const { data } = await api.put(`${MOVIES}/theaters/${id}`, payload);
  return data.theater;
};

export const deleteTheater = async (id) => {
  const { data } = await api.delete(`${MOVIES}/theaters/${id}`);
  return data;
};

// ── Admin: shows ──────────────────────────────────────────────────────────
export const createShow = async (payload) => {
  const { data } = await api.post(`${MOVIES}/shows`, payload);
  return data.show;
};

export const deleteShow = async (id) => {
  const { data } = await api.delete(`${MOVIES}/shows/${id}`);
  return data;
};

// ── Booking flow ──────────────────────────────────────────────────────────
export const reserveSeats = async ({ showId, seatNumbers, name, email, phone }) => {
  const { data } = await api.post(`${BOOKINGS}/reserve`, { showId, seatNumbers, name, email, phone });
  return data.booking;
};

export const cancelReservation = async (bookingId) => {
  const { data } = await api.delete(`${BOOKINGS}/${bookingId}/cancel`);
  return data;
};

export const createMovieOrder = async (bookingId) => {
  const { data } = await api.post(`${BOOKINGS}/order`, { bookingId });
  return data;
};

export const verifyMoviePayment = async (payload) => {
  const { data } = await api.post(`${BOOKINGS}/verify`, payload);
  return data;
};

export const getUserMovieBookings = async () => {
  const { data } = await api.get(`${BOOKINGS}/my`);
  return data;
};

export const getMovieBookingById = async (id) => {
  const { data } = await api.get(`${BOOKINGS}/${id}`);
  return data;
};

// Returns a Blob — caller triggers the browser download
export const downloadMovieInvoice = async (bookingId) => {
  const response = await api.get(`${BOOKINGS}/${bookingId}/invoice`, { responseType: "blob" });
  return response.data;
};