const express = require("express");
const router = express.Router();

const {
  searchTmdb,
  importMovie,
  getMovies,
  getMovieById,
  setMovieActive,
} = require("../controllers/movieController");

const {
  createTheater,
  getTheaters,
  updateTheater,
  deleteTheater,
} = require("../controllers/theaterController");

const {
  createShow,
  getShowsForMovie,
  getShowById,
  deleteShow,
} = require("../controllers/showController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ── Movies ────────────────────────────────────────────────────────────────
router.get("/tmdb/search", verifyToken, verifyAdmin, searchTmdb); // admin browsing TMDB to import
router.post("/import", verifyToken, verifyAdmin, importMovie);
router.get("/", getMovies);                 // public listing
router.get("/:id", getMovieById);           // public detail
router.patch("/:id/active", verifyToken, verifyAdmin, setMovieActive);

// ── Theaters ──────────────────────────────────────────────────────────────
router.post("/theaters", verifyToken, verifyAdmin, createTheater);
router.get("/theaters/list", getTheaters); // public — needed for city/theater filters
router.put("/theaters/:id", verifyToken, verifyAdmin, updateTheater);
router.delete("/theaters/:id", verifyToken, verifyAdmin, deleteTheater);

// ── Shows ─────────────────────────────────────────────────────────────────
router.post("/shows", verifyToken, verifyAdmin, createShow);
router.get("/:movieId/shows", getShowsForMovie);   // public — showtimes for a movie
router.get("/shows/:id", getShowById);              // public — full seat map for one show
router.delete("/shows/:id", verifyToken, verifyAdmin, deleteShow);

module.exports = router;