const axios = require("axios");
const dns = require("dns");

// Requires TMDB_API_KEY in your .env — get a free key at
// https://www.themoviedb.org/settings/api (v3 auth, "API Key" field, not the
// longer "API Read Access Token" — either works with this setup, but the
// short api_key is simpler to wire in as a query param like below).
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// NEW — on some networks (notably IPv6-only/NAT64 mobile hotspots), Node's
// dual-stack "happy eyeballs" connection algorithm can fail to connect over
// either address family even though the OS can resolve DNS fine (same root
// cause as the MongoDB ETIMEDOUT issue). Forcing this specific axios client
// to resolve and connect over IPv4 only sidesteps that failure mode.
const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: process.env.TMDB_API_KEY },
  family: 4, // IPv4 only for this client
  lookup: (hostname, options, callback) => dns.lookup(hostname, { ...options, family: 4 }, callback),
});

// ── Search movies by title — used by admin's "import movie" search box ──────
exports.searchMovies = async (query, page = 1) => {
  const { data } = await tmdb.get("/search/movie", { params: { query, page } });
  return data; // { page, results: [...], total_pages, total_results }
};

// ── Currently-playing movies — used to seed a default "browse" list ────────
exports.getNowPlaying = async (page = 1) => {
  const { data } = await tmdb.get("/movie/now_playing", { params: { page } });
  return data;
};

// ── Full details for one movie by its TMDB id — used at import time to get
// genres, runtime, etc. that the search endpoint doesn't include. ──────────
exports.getMovieDetails = async (tmdbId) => {
  const { data } = await tmdb.get(`/movie/${tmdbId}`);
  return data;
};

// ── Build a usable poster/backdrop URL from TMDB's relative path ───────────
// size options: "w200", "w342", "w500", "w780", "original" (posters)
//               "w300", "w780", "w1280", "original" (backdrops)
exports.buildImageUrl = (path, size = "w500") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};