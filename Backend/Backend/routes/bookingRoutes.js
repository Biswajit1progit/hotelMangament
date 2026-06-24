const express = require("express");
const router = express.Router();
const { createBooking, checkAvailability, getUserBookings } = require("../controllers/bookingController");
const Booking = require("../models/Booking");
const { verifyToken } = require("../middleware/authMiddleware");

// ✅ FIXED — added verifyToken. Without it req.user is undefined and
// createBooking crashes with 500 when it tries to read req.user._id.
router.post("/", verifyToken, createBooking);

router.post("/check-availability", checkAvailability);

// ✅ FIXED — moved ABOVE /:id. Express matches routes top to bottom, so
// if /:id comes first, GET /user/me is matched as /:id with id="me",
// which hits Booking.findById("me"), fails, and getUserBookings never runs.
// Specific routes must always be declared before parameterised ones.
router.get("/user/me", verifyToken, getUserBookings);

// ✅ GET booking by ID — kept below /user/me so it doesn't swallow it
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;