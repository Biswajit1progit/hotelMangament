const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theater = require("../models/Theater");

// ── Helper: generate a seat map from simple config ──────────────────────
// rows: number of rows (lettered A, B, C...)
// seatsPerRow: number of seats in each row
// premiumRows: which row letters cost the premium price (e.g. ["A", "B"])
function generateSeats({ rows, seatsPerRow, standardPrice, premiumPrice, premiumRows = [] }) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // 65 = 'A'
    const isPremium = premiumRows.includes(rowLetter);
    for (let c = 1; c <= seatsPerRow; c++) {
      seats.push({
        seatNumber: `${rowLetter}${c}`,
        row: rowLetter,
        col: c,
        seatType: isPremium ? "premium" : "standard",
        price: isPremium ? premiumPrice : standardPrice,
        status: "available",
        bookingId: null,
      });
    }
  }
  return seats;
}

// ── Admin: create a show (screening) with a generated seat map ──────────
exports.createShow = async (req, res) => {
  try {
    const {
      movieId, theaterId, screenNumber, showDate, showTime,
      rows, seatsPerRow, standardPrice, premiumPrice, premiumRows,
    } = req.body;

    if (!movieId || !theaterId || !showDate || !showTime || !rows || !seatsPerRow || !standardPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [movie, theater] = await Promise.all([
      Movie.findById(movieId),
      Theater.findById(theaterId),
    ]);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    const seats = generateSeats({
      rows: Number(rows),
      seatsPerRow: Number(seatsPerRow),
      standardPrice: Number(standardPrice),
      premiumPrice: premiumPrice ? Number(premiumPrice) : Number(standardPrice),
      premiumRows: premiumRows || [],
    });

    const show = await Show.create({
      movie: movieId,
      theater: theaterId,
      screenNumber: screenNumber || 1,
      showDate: new Date(showDate),
      showTime,
      seats,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Show created", show });
  } catch (err) {
    console.error("createShow error:", err);
    res.status(500).json({ message: err.message || "Failed to create show" });
  }
};

// ── Public: list shows for a movie, optionally filtered by city/date ────
exports.getShowsForMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { city, date } = req.query;

    const filter = { movie: movieId };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.showDate = { $gte: start, $lte: end };
    }

    let shows = await Show.find(filter)
      .populate("theater", "name city address")
      .sort({ showDate: 1, showTime: 1 });

    if (city) {
      shows = shows.filter((s) => s.theater?.city?.toLowerCase() === city.toLowerCase());
    }

    // Don't send the full seat array here — just a count, to keep the
    // "pick a showtime" list lightweight. Full seat map is fetched
    // separately once a specific show is selected (getShowById below).
    const summarized = shows.map((s) => ({
      _id: s._id,
      theater: s.theater,
      screenNumber: s.screenNumber,
      showDate: s.showDate,
      showTime: s.showTime,
      totalSeats: s.seats.length,
      availableSeats: s.seats.filter((seat) => seat.status === "available").length,
    }));

    res.json({ shows: summarized });
  } catch (err) {
    console.error("getShowsForMovie error:", err);
    res.status(500).json({ message: "Failed to fetch shows" });
  }
};

// ── Public: single show with full seat map — used on the seat-picker page ──
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie", "title posterPath")
      .populate("theater", "name city address");
    if (!show) return res.status(404).json({ message: "Show not found" });

    res.json({ show });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch show" });
  }
};

// ── Admin: delete a show (only if no seats are booked — guards against
// wiping out a screening someone already paid for) ──────────────────────
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const hasBookedSeats = show.seats.some((s) => s.status === "booked");
    if (hasBookedSeats) {
      return res.status(400).json({ message: "Cannot delete a show with active bookings" });
    }

    await Show.findByIdAndDelete(req.params.id);
    res.json({ message: "Show deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete show" });
  }
};