const express  = require("express");
const router   = express.Router();
const Booking  = require("../models/Booking");
const { createBooking, checkAvailability, getUserBookings } = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");

// POST — create booking (verifyToken already present ✅)
router.post("/", verifyToken, createBooking);

// POST — check availability (public is fine — no sensitive data returned)
router.post("/check-availability", checkAvailability);

// GET — current user's bookings (verifyToken + specific route above /:id ✅)
router.get("/user/me", verifyToken, getUserBookings);

// GET — single booking by ID
// CHANGED: added verifyToken + ownership check.
// Previously: anyone who knew/guessed a booking ObjectId could fetch it
// in a browser tab with zero auth — exposed guest name, email, dates, amount.
// Now: must be logged in AND the booking must belong to req.user.id.
// Admin bypass included so admins can still look up any booking.
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    // ── Ownership check ────────────────────────────────────────────────────
    // Allow if: booking belongs to this user OR the requester is an admin.
    // booking.userId is the ObjectId stored when the booking was created.
    // req.user.id comes from the verified JWT — cannot be faked.
    const isOwner = booking.userId?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Access denied" });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;