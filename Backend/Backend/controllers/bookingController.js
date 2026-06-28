const Booking = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Hotel = require("../models/hotel");
const mongoose = require("mongoose");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Shared helper — unchanged ────────────────────────────────────────────
const getAvailability = async (hotelId, checkIn, checkOut, requestedRooms) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return { error: "Hotel not found", status: 404 };
  }

  const totalRooms = hotel.rooms;

  const overlapping = await Booking.find({
    hotelId,
    $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
  });

  const bookedRooms = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
  const remainingRooms = totalRooms - bookedRooms;
  const isAvailable = remainingRooms >= requestedRooms;

  return {
    totalRooms,
    bookedRooms,
    remainingRooms,
    requestedRooms,
    isAvailable,
    overlappingBookings: overlapping.length,
  };
};

// ✅ Transaction-based createBooking — now with a forced write conflict
// on the Hotel document so concurrent requests can't both pass the
// availability check and insert overlapping bookings.
//
// Why this was needed: a MongoDB transaction guarantees that everything
// INSIDE it is atomic and consistent as a unit, but it does NOT create
// mutual exclusion between two SEPARATE transactions unless they both
// try to write to the SAME document. Our previous version only read
// the Hotel doc and inserted brand-new, distinct Booking docs — nothing
// for MongoDB to detect a conflict on, so two concurrent requests could
// both see "rooms available" and both succeed, causing real overbooking.
//
// The fix: write to hotel.lastBookingAttempt inside the transaction,
// every time, regardless of outcome. This field carries no business
// meaning — we never read it for any decision — its only purpose is to
// give MongoDB a real point of contention. If two transactions both try
// to update the SAME Hotel document at the same time, MongoDB detects
// the write conflict and aborts one of them with a
// TransientTransactionError, which we catch below and turn into a
// clean 409 for the client.
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });
    }

    const requestedRooms = Number(rooms) || 1;
    let savedBooking;

    await session.withTransaction(async () => {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const hotel = await Hotel.findById(hotelId).session(session);
      if (!hotel) {
        throw Object.assign(new Error("Hotel not found"), { status: 404 });
      }

      const overlapping = await Booking.find({
        hotelId,
        $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
      }).session(session);

      const bookedRooms = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
      const remainingRooms = hotel.rooms - bookedRooms;

      if (remainingRooms < requestedRooms) {
        throw Object.assign(new Error("Rooms no longer available for the selected dates."), {
          status: 409,
          code: "ROOMS_UNAVAILABLE",
        });
      }

      // ✅ NEW — forces a real write conflict between concurrent
      // transactions touching the same hotel. This is the line that
      // actually closes the race condition.
      hotel.lastBookingAttempt = new Date();
      await hotel.save({ session });

      const booking = new Booking({ ...req.body, userId: req.user._id });
      savedBooking = await booking.save({ session });
    });

    res.status(201).json({ message: "Booking successful", data: savedBooking });
  } catch (error) {
    // ✅ NEW — surface MongoDB's transient write-conflict error as a
    // clean, expected 409 instead of leaking it as a raw 500. This is
    // the signal that the race was caught and this request lost fairly.
    if (error.errorLabels?.includes("TransientTransactionError")) {
      return res.status(409).json({
        error: "Booking conflict detected, please try again.",
        code: "RETRY_BOOKING",
      });
    }

    res.status(error.status || 500).json({
      error: error.message,
      code: error.code,
    });
  } finally {
    session.endSession();
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });
    }

    const requestedRooms = Number(rooms) || 1;
    const availability = await getAvailability(hotelId, checkIn, checkOut, requestedRooms);

    if (availability.error) {
      return res.status(availability.status).json({ error: availability.error });
    }

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 }); // newest first
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createBooking, checkAvailability, getUserBookings };