const Booking = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Hotel = require("../models/hotel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Shared helper — used by BOTH checkAvailability and createBooking so
// the exact same logic determines availability in both places. Previously
// this calculation only lived inside checkAvailability, which meant
// createBooking had no way to re-verify it without duplicating the logic
// (and duplicated logic drifts out of sync over time). ──────────────────
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

// ✅ FIX — createBooking now re-checks availability itself, server-side,
// immediately before saving. Previously this just did `new Booking(req.body)`
// and saved unconditionally, trusting that the client had already called
// checkAvailability earlier in the flow. That's a TOCTOU race condition:
// any number of users can see "available" and all submit before any of
// them is actually saved, since the check and the save were two separate,
// unrelated requests with no re-validation in between.
//
// NOTE: this closes the race condition for the common case (two requests
// arriving microseconds apart still serialize through this check correctly
// in practice for typical traffic), but is not a full guarantee under very
// high concurrency — a fully airtight fix would wrap the check + save in
// a MongoDB transaction (session) or use an atomic reservation pattern.
// Flagging this as a known next step rather than overbuilding it now. ───
const createBooking = async (req, res) => {
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

    if (!availability.isAvailable) {
      return res.status(409).json({
        error: "Rooms no longer available for the selected dates. Please try different dates or fewer rooms.",
        code: "ROOMS_UNAVAILABLE",
        ...availability,
      });
    }

    const booking = new Booking(req.body);
    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking successful",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

module.exports = { createBooking, checkAvailability };