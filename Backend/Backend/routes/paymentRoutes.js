const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, cancelBookingRefund } = require("../controllers/paymentController");
const Payment=require("../models/Payment");
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/receipt/:bookingId", async (req, res) => {
  try {
    const Payment = require("../models/Payment");

    const payment = await Payment.findOne({
      bookingId: req.params.bookingId,
    });

    res.json(payment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:email", async (req, res) => {
  const payments = await Payment.find({ email: req.params.email });
  res.json(payments);
});

router.put("/refund/:paymentId", cancelBookingRefund);
module.exports = router;