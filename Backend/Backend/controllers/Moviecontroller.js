const Movie = require("../models/Movie");
const tmdbService = require("../service/Tmdbservice");

// ── Admin: search TMDB to find a movie to import ────────────────────────
// This does NOT touch your database — it's a passthrough search so the
// admin can browse results before deciding what to import.
exports.searchTmdb = async (req, res) => {
  try {
    const { query, page } = req.query;
    if (!query) return res.status(400).json({ message: "query is required" });

    const data = await tmdbService.searchMovies(query, page || 1);

    // Trim the response down to what the admin UI actually needs
    const results = data.results.map((m) => ({
      tmdbId: m.id,
      title: m.title,
      overview: m.overview,
      posterUrl: tmdbService.buildImageUrl(m.poster_path, "w200"),
      releaseDate: m.release_date,
      voteAverage: m.vote_average,
    }));

    res.json({ page: data.page, totalPages: data.total_pages, results });
  } catch (err) {
    // TEMP DEBUG — dumping everything since the response-based fields came back empty,
    // which suggests this might be a network-level failure (DNS, connection refused,
    // timeout) rather than TMDB rejecting the request.
    console.error("searchTmdb RAW error object:", err);
    console.error("searchTmdb error.code:", err.code);
    console.error("searchTmdb error.name:", err.name);
    console.error("searchTmdb error.stack:", err.stack);
    res.status(500).json({
      message: "Failed to search TMDB — check TMDB_API_KEY in your .env",
      debug: {
        code: err.code,
        name: err.name,
        message: err.message,
        tmdbResponse: err.response?.data,
        status: err.response?.status,
      },
    });
  }
};

// ── Admin: import a movie from TMDB into the local Movie collection ─────
exports.importMovie = async (req, res) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) return res.status(400).json({ message: "tmdbId is required" });

    const existing = await Movie.findOne({ tmdbId });
    if (existing) {
      return res.status(409).json({ message: "This movie is already imported", movie: existing });
    }

    const details = await tmdbService.getMovieDetails(tmdbId);

    const movie = await Movie.create({
      tmdbId: details.id,
      title: details.title,
      overview: details.overview,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      genres: (details.genres || []).map((g) => g.name),
      releaseDate: details.release_date ? new Date(details.release_date) : undefined,
      runtimeMinutes: details.runtime,
      voteAverage: details.vote_average,
      language: details.original_language,
      importedBy: req.user._id,
    });

    res.status(201).json({ message: "Movie imported", movie });
  } catch (err) {
    console.error("importMovie error:", err);
    res.status(500).json({ message: "Failed to import movie" });
  }
};

// ── Public: list locally-imported movies (with poster URLs resolved) ────
exports.getMovies = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search) filter.$text = { $search: search };

    const movies = await Movie.find(filter).sort({ releaseDate: -1 });

    const withImages = movies.map((m) => ({
      ...m.toObject(),
      posterUrl: tmdbService.buildImageUrl(m.posterPath, "w500"),
      backdropUrl: tmdbService.buildImageUrl(m.backdropPath, "w1280"),
    }));

    res.json({ movies: withImages });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};

// ── Public: single movie detail ──────────────────────────────────────────
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.json({
      ...movie.toObject(),
      posterUrl: tmdbService.buildImageUrl(movie.posterPath, "w500"),
      backdropUrl: tmdbService.buildImageUrl(movie.backdropPath, "w1280"),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch movie" });
  }
};

// ── Admin: hide a movie without deleting it (shows may still reference it) ──
exports.setMovieActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const movie = await Movie.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.json({ message: "Movie updated", movie });
  } catch (err) {
    res.status(500).json({ message: "Failed to update movie" });
  }
};