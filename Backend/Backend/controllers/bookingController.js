const Booking  = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment  = require("../models/Payment");
const Hotel    = require("../models/hotel");
const mongoose = require("mongoose");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Shared helper ─────────────────────────────────────────────────────────────
const getAvailability = async (hotelId, checkIn, checkOut, requestedRooms) => {
  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return { error: "Hotel not found", status: 404 };

  const totalRooms = hotel.rooms;
  const overlapping = await Booking.find({
    hotelId,
    $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
  });

  const bookedRooms    = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
  const remainingRooms = totalRooms - bookedRooms;
  const isAvailable    = remainingRooms >= requestedRooms;

  return {
    totalRooms, bookedRooms, remainingRooms,
    requestedRooms, isAvailable,
    overlappingBookings: overlapping.length,
  };
};


// ── createBooking ─────────────────────────────────────────────────────────────
// CHANGED: req.user._id → req.user.id
// Old verifyToken did User.findById() and returned a Mongoose doc (which has ._id).
// New verifyToken decodes JWT and sets req.user from the payload (which has .id).
// Using req.user._id with new middleware = undefined = booking stored with no userId
// = ownership check in GET /:id always fails.
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut)
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });

    const requestedRooms = Number(rooms) || 1;
    let savedBooking;

    await session.withTransaction(async () => {
      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const hotel = await Hotel.findById(hotelId).session(session);
      if (!hotel)
        throw Object.assign(new Error("Hotel not found"), { status: 404 });

      const overlapping = await Booking.find({
        hotelId,
        $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
      }).session(session);

      const bookedRooms    = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
      const remainingRooms = hotel.rooms - bookedRooms;

      if (remainingRooms < requestedRooms)
        throw Object.assign(
          new Error("Rooms no longer available for the selected dates."),
          { status: 409, code: "ROOMS_UNAVAILABLE" }
        );

      // Force write conflict to close race condition (see original comment)
      hotel.lastBookingAttempt = new Date();
      await hotel.save({ session });

      const booking = new Booking({
        ...req.body,
        userId: req.user.id,   // ✅ FIXED: was req.user._id (undefined with new middleware)
      });
      savedBooking = await booking.save({ session });
    });

    res.status(201).json({ message: "Booking successful", data: savedBooking });
  } catch (error) {
    if (error.errorLabels?.includes("TransientTransactionError")) {
      return res.status(409).json({
        error: "Booking conflict detected, please try again.",
        code: "RETRY_BOOKING",
      });
    }
    res.status(error.status || 500).json({ error: error.message, code: error.code });
  } finally {
    session.endSession();
  }
};


// ── checkAvailability ─────────────────────────────────────────────────────────
// No auth needed — unchanged
const checkAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;
    if (!hotelId || !checkIn || !checkOut)
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });

    const requestedRooms = Number(rooms) || 1;
    const availability   = await getAvailability(hotelId, checkIn, checkOut, requestedRooms);

    if (availability.error)
      return res.status(availability.status).json({ error: availability.error });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ── getUserBookings ───────────────────────────────────────────────────────────
// CHANGED: req.user._id → req.user.id (same reason as createBooking)
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })  // ✅ FIXED
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { createBooking, checkAvailability, getUserBookings };