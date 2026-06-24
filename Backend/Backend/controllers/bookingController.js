const Booking = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Hotel = require("../models/hotel");

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

// ✅ CHANGED — added userId: req.user._id when creating the booking.
//
// Previously: const booking = new Booking(req.body)
//   → spread req.body directly, so no userId was ever saved.
//   → getUserBookings had to fall back to email string matching,
//     which breaks if the user typed a different email than their
//     auth token email (e.g. Google OAuth users).
//
// Now: userId is explicitly set from req.user._id (verified JWT token),
//   completely independent of whatever email the user typed in the form.
//   This requires verifyToken middleware on the createBooking route,
//   which should already be in place since you added it earlier.
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

    // ✅ CHANGED — spread req.body first, then explicitly set userId from
    // the verified token. If req.body somehow contained a userId field
    // (e.g. a malicious client sending it manually), this overwrites it
    // with the real value from the token — can never be spoofed.
    const booking = new Booking({
      ...req.body,
      userId: req.user._id,
    });

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

// ✅ CHANGED — now queries by userId (ObjectId) instead of email (string).
//
// Previously: Booking.find({ email: req.user.email })
//   → email in booking came from a form input the user typed
//   → email in token comes from their registered account
//   → these can differ (Google OAuth, typo, different email used) causing
//     bookings to silently not appear in the profile page.
//
// Now: Booking.find({ userId: req.user._id })
//   → direct ObjectId match, set at booking creation from the auth token
//   → always correct, can never mismatch
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