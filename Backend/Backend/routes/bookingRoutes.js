const express = require("express");
const router = express.Router();
const { createBooking,checkAvailability  } = require("../controllers/bookingController");
const Booking = require("../models/Booking"); // ✅ FIX

router.post("/", createBooking);

// ✅ NEW: POST check availability for a hotel + date range
router.post("/check-availability", checkAvailability);
/* router.post("/cancel/:id", cancelBooking); */
// ✅ GET booking by ID
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
router.get("/user/:email", async (req, res) => {
  const bookings = await Booking.find({ email: req.params.email });
  res.json(bookings);
});

module.exports = router;