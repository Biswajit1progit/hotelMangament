const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, cancelBookingRefund, getUserPayments } = require("../controllers/paymentController");
const Payment = require("../models/Payment");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/create-order", verifyToken, createOrder);

router.post("/verify", verifyToken, verifyPayment);

// ✅ FIXED — added verifyToken. Previously anyone who knew a bookingId
// could fetch the full payment receipt (amount, hotel, Razorpay payment ID,
// order number) with zero login required.
/* router.get("/receipt/:bookingId", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      bookingId: req.params.bookingId,
    });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */
// ✅ FIXED — added verifyToken. Previously anyone who knew a bookingId
// could fetch the full payment receipt (amount, hotel, Razorpay payment ID,
// order number) with zero login required.
router.get("/receipt/:bookingId", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      bookingId: req.params.bookingId,
    }).populate("bookingId", "checkIn checkOut"); // ✅ ADDED — pulls stay
      // dates from the linked Booking doc, since Payment itself only
      // snapshots hotelName/guests/rooms/nights, not checkIn/checkOut.
      // Works for old payments too, since it's a live lookup, not a
      // stored copy.

    if (!payment) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    // ✅ ADDED — flatten so the frontend can read data.checkIn / data.checkOut
    // directly, instead of needing to know that they live inside a nested
    // bookingId object. Keeps Invoice.jsx and generatePDF.js unchanged
    // in shape — they just read data.checkIn / data.checkOut like normal.
    const receipt = payment.toObject();
    receipt.checkIn = payment.bookingId?.checkIn || null;
    receipt.checkOut = payment.bookingId?.checkOut || null;
    receipt.bookingId = payment.bookingId?._id || payment.bookingId; // restore as plain id, not the populated object

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/user/me", verifyToken, getUserPayments);

// ✅ FIXED — added verifyToken. Previously anyone (no login required)
// could attempt a refund on any payment by guessing or knowing a paymentId.
router.put("/refund/:paymentId", verifyToken, cancelBookingRefund);

module.exports = router;