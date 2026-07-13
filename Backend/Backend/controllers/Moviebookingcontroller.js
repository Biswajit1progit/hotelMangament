const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theater = require("../models/Theater");
const MovieBooking = require("../models/MovieBooking");
const { verifySignature } = require("../utils/verifySignature");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const RESERVATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes to complete payment

// ── Reserve seats — creates a pending_payment MovieBooking and atomically
// flips the chosen seats to "booked" so no one else can grab them mid-checkout.
// Same spirit as bookingController.createBooking's transaction + re-check
// pattern, adapted for discrete seats instead of a room count. ─────────────
exports.reserveSeats = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { showId, seatNumbers, name, email, phone } = req.body;

    if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ error: "showId and seatNumbers[] are required" });
    }

    let savedBooking;

    await session.withTransaction(async () => {
      const show = await Show.findById(showId).session(session);
      if (!show) {
        throw Object.assign(new Error("Show not found"), { status: 404 });
      }

      // Re-check every requested seat is still available — the real
      // authority, same principle as your hotel availability re-check.
      const requestedSet = new Set(seatNumbers);
      const seatMap = new Map(show.seats.map((s) => [s.seatNumber, s]));

      const unavailable = [];
      let totalPrice = 0;
      for (const num of requestedSet) {
        const seat = seatMap.get(num);
        if (!seat) unavailable.push(num); // seat number doesn't exist on this show
        else if (seat.status !== "available") unavailable.push(num);
        else totalPrice += seat.price;
      }

      if (unavailable.length > 0) {
        throw Object.assign(
          new Error(`These seats are no longer available: ${unavailable.join(", ")}`),
          { status: 409, code: "SEATS_UNAVAILABLE" }
        );
      }

      const [movie, theater] = await Promise.all([
        Movie.findById(show.movie).session(session),
        Theater.findById(show.theater).session(session),
      ]);

      const booking = new MovieBooking({
        show: showId,
        userId: req.user.id,
        movieTitle: movie?.title || "Unknown",
        theaterName: theater?.name || "Unknown",
        showDate: show.showDate,
        showTime: show.showTime,
        seats: [...requestedSet],
        totalPrice,
        name,
        email,
        phone,
        status: "pending_payment",
        reservationExpiresAt: new Date(Date.now() + RESERVATION_WINDOW_MS),
      });
      savedBooking = await booking.save({ session });

      // Flip the reserved seats to "booked", tagged with this booking's id.
      // Modifying the Show doc inside the transaction is what makes MongoDB
      // detect a write conflict if two people race for the same seat —
      // the loser's transaction fails and retries/rejects automatically.
      show.seats.forEach((seat) => {
        if (requestedSet.has(seat.seatNumber)) {
          seat.status = "booked";
          seat.bookingId = savedBooking._id;
        }
      });
      await show.save({ session });
    });

    res.status(201).json({ message: "Seats reserved", booking: savedBooking });
  } catch (error) {
    if (error.errorLabels?.includes("TransientTransactionError")) {
      return res.status(409).json({
        error: "Someone else grabbed one of these seats just now, please try again.",
        code: "RETRY_RESERVATION",
      });
    }
    res.status(error.status || 500).json({ error: error.message, code: error.code });
  } finally {
    session.endSession();
  }
};

// ── Release a booking's seats — called on explicit cancel, or by the sweep
// job below for expired unpaid reservations. ───────────────────────────────
const releaseBookingSeats = async (bookingId, session) => {
  const booking = await MovieBooking.findById(bookingId).session(session || null);
  if (!booking || booking.status !== "pending_payment") return;

  await Show.updateOne(
    { _id: booking.show },
    {
      $set: {
        "seats.$[seat].status": "available",
        "seats.$[seat].bookingId": null,
      },
    },
    {
      arrayFilters: [{ "seat.seatNumber": { $in: booking.seats } }],
      session: session || undefined,
    }
  );

  booking.status = "expired";
  await booking.save({ session: session || undefined });
};

// ── Sweep job — releases any reservation whose payment window expired.
// Wire this into a cron the same way you already run runCheckoutNotifier
// in server.js (e.g. setInterval every minute, or a scheduled script). ────
exports.releaseExpiredReservations = async () => {
  const expired = await MovieBooking.find({
    status: "pending_payment",
    reservationExpiresAt: { $lt: new Date() },
  });

  for (const booking of expired) {
    try {
      await releaseBookingSeats(booking._id);
    } catch (err) {
      console.error(`Failed to release expired booking ${booking._id}:`, err.message);
    }
  }

  return expired.length;
};

// ── User explicitly cancels an unpaid reservation ───────────────────────
exports.cancelReservation = async (req, res) => {
  try {
    const booking = await MovieBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (booking.status !== "pending_payment") {
      return res.status(400).json({ message: "Only pending reservations can be cancelled" });
    }

    await releaseBookingSeats(booking._id);
    res.json({ message: "Reservation cancelled, seats released" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel reservation" });
  }
};

// ── Razorpay order — isolated from paymentController.createOrder ────────
exports.createMovieOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await MovieBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "pending_payment") {
      return res.status(400).json({ error: "This booking is no longer awaiting payment" });
    }
    if (booking.reservationExpiresAt < new Date()) {
      await releaseBookingSeats(booking._id);
      return res.status(410).json({ error: "Reservation expired, please select seats again" });
    }

    const order = await razorpay.orders.create({
      amount: booking.totalPrice * 100,
      currency: "INR",
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Verify payment + confirm booking — isolated from paymentController.verifyPayment ──
exports.verifyMoviePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const isValid = verifySignature(
      razorpay_order_id, razorpay_payment_id,
      razorpay_signature, process.env.RAZORPAY_KEY_SECRET
    );
    if (!isValid) return res.status(400).json({ success: false });

    const booking = await MovieBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Booking already processed" });
    }

    booking.status = "confirmed";
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    await booking.save();

    res.json({ message: "Payment successful, booking confirmed" });
  } catch (err) {
    console.error("verifyMoviePayment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Single booking by id — used by the payment page ──────────────────────
exports.getMovieBookingById = async (req, res) => {
  try {
    const booking = await MovieBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

// ── User's movie booking history ─────────────────────────────────────────
exports.getUserMovieBookings = async (req, res) => {
  try {
    const bookings = await MovieBooking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};