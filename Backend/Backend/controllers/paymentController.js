const Razorpay = require("razorpay");
const Payment  = require("../models/Payment");
const Booking  = require("../models/Booking");
const Hotel    = require("../models/hotel");
const { verifySignature }      = require("../utils/verifySignature");
const generateOrderId          = require("../utils/generateOrderId");
const generateInvoicePDF       = require("../utils/generateInvoicepdf");
const { sendPaymentConfirmation } = require("../service/emailService");
const { createNotification }   = require("./notificationController");
const { confirmOfferForPayment, redeemOfferInternal } = require("./offerController"); // NEW
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const REFUND_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

// ── createOrder — no user fields needed, unchanged ───────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount:   amount * 100,
      currency: "INR",
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── verifyPayment ─────────────────────────────────────────────────────────────
// NEW: if the booking has an offerId attached (set at createBooking time), this
// now enforces the payment-method restriction for real (using the actual `method`
// Razorpay returned) and redeems the offer — incrementing usedCount and writing
// an OfferRedemption record — only once payment is confirmed valid.
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      bookingId, amount, method,
    } = req.body;

    const isValid = verifySignature(
      razorpay_order_id, razorpay_payment_id,
      razorpay_signature, process.env.RAZORPAY_KEY_SECRET
    );
    if (!isValid) return res.status(400).json({ success: false });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // ── NEW: enforce + redeem offer if one was applied to this booking ──────
    let discountApplied = 0;
    if (booking.offerId) {
      try {
        const preDiscountAmount = amount + (booking.discountApplied || 0);

        const { discount } = await confirmOfferForPayment({
          offerId: booking.offerId,
          bookingAmount: preDiscountAmount,
          paymentMethod: method,
        });

        await redeemOfferInternal({
          offerId: booking.offerId,
          userId: req.user.id,
          bookingId: booking._id,
          discountApplied: discount,
        });

        discountApplied = discount;
      } catch (offerErr) {
        console.warn("Offer redemption failed:", offerErr.message);
        return res.status(400).json({ success: false, message: offerErr.message });
      }
    }

    const payment = new Payment({
      bookingId,
      amount,
      paymentMethod:     method,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId:   razorpay_order_id,
      status:            "success",
      orderNumber:       generateOrderId(),
      hotelName:         booking.hotelName,
      guests:            booking.guests,
      rooms:             booking.rooms,
      nights:            booking.nights,
      name:              booking.name,
      email:             booking.email,
      userId:            req.user.id,
      discountApplied,   // NEW — nice to have on the Payment record too
    });

    await payment.save();

    // ── Notifications (unchanged) ─────────────────────────────────────────
    try {
      await createNotification({
        userEmail: booking.email,
        title:     "Booking Confirmed ✅",
        message:   `Your booking at ${booking.hotelName} is confirmed! Check-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} | Check-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} | Amount paid: ₹${amount}`,
        type:      "booking_confirmed",
        bookingId: booking._id,
      });
    } catch (err) { console.warn("Booking confirmed notification failed:", err.message); }

    try {
      const hotel = await Hotel.findById(booking.hotelId);
      const checkOutDate    = new Date(booking.checkOut);
      const daysUntilCheckout = Math.ceil((checkOutDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilCheckout <= 30 && hotel) {
        await createNotification({
          userEmail: booking.email,
          title:     "Room Available 🏨",
          message:   `Your room at ${booking.hotelName} is ready! Check-in on ${new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Enjoy your stay! ${hotel.amenities?.length ? `Amenities: ${hotel.amenities.slice(0, 3).join(", ")}` : ""}`,
          type:      "room_available",
          bookingId: booking._id,
        });
      }
    } catch (err) { console.warn("Room available notification failed:", err.message); }

    // ── Invoice email (unchanged) ─────────────────────────────────────────
    try {
      const pdfBuffer = await generateInvoicePDF({
        orderNumber:       payment.orderNumber,
        razorpayPaymentId: razorpay_payment_id,
        name:              booking.name,
        email:             booking.email,
        hotelName:         booking.hotelName,
        rooms:             booking.rooms,
        guests:            booking.guests,
        nights:            booking.nights,
        amount,
        createdAt:         payment.createdAt,
      });

      await sendPaymentConfirmation({
        to:       booking.email,
        userName: booking.name,
        hotel: {
          name:     booking.hotelName,
          location: "",
          price:    Math.round(amount / booking.nights),
        },
        booking: {
          bookingId:   payment._id,
          checkIn:     booking.checkIn,
          checkOut:    booking.checkOut,
          amount,
          nights:      booking.nights,
          paymentId:   razorpay_payment_id,
          paymentDate: payment.createdAt,
        },
        pdfBuffer,
      });
    } catch (emailErr) { console.warn("Payment email failed:", emailErr.message); }

    res.json({ message: "Payment Successful" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── cancelBookingRefund ───────────────────────────────────────────────────────
// Unchanged from your version — ownership check already in place.
exports.cancelBookingRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const isOwner = payment.userId?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ success: false, message: "Access denied" });

    if (payment.status === "refunded")
      return res.status(400).json({ success: false, message: "This booking has already been refunded" });

    const elapsed = Date.now() - new Date(payment.createdAt).getTime();
    if (elapsed > REFUND_WINDOW_MS)
      return res.status(400).json({
        success: false,
        message: "Refund window has expired. Prepaid bookings are non-refundable after 2 hours of payment.",
        code: "REFUND_WINDOW_EXPIRED",
      });

    payment.status       = "refunded";
    payment.refundDate   = new Date();
    payment.refundAmount = payment.amount;
    await payment.save();

    try {
      await createNotification({
        userEmail: payment.email,
        title:     "Refund Processed 💰",
        message:   `Your refund of ₹${payment.amount} for booking at ${payment.hotelName} has been processed successfully.`,
        type:      "general",
        bookingId: payment.bookingId,
      });
    } catch (err) { console.warn("Refund notification failed:", err.message); }

    res.json({ success: true, message: "Refund successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Refund failed" });
  }
};

// ── getUserPayments ───────────────────────────────────────────────────────────
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};