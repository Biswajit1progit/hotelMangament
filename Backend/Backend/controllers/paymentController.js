const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Hotel = require("../models/hotel");
const { verifySignature } = require("../utils/verifySignature");
const generateOrderId = require("../utils/generateOrderId");
const generateInvoicePDF = require("../utils/generateInvoicepdf");
const { sendPaymentConfirmation } = require("../service/emailService");
const { createNotification } = require("./notificationController");
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify payment + send notifications
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      amount,
      method,
    } = req.body;

    // 🔐 Verify Razorpay signature
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) return res.status(400).json({ success: false });

    const booking = await Booking.findById(bookingId);

    const payment = new Payment({
      bookingId,
      amount,
      paymentMethod: method,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: "success",
      orderNumber: generateOrderId(),
      hotelName: booking.hotelName,
      guests: booking.guests,
      rooms: booking.rooms,
      nights: booking.nights,
      name: booking.name,
      email: booking.email,
    });

    await payment.save();

    // ✅ 1. Booking confirmed notification — fires only after payment verified
    try {
      await createNotification({
        userEmail: booking.email,
        title: "Booking Confirmed ✅",
        message: `Your booking at ${booking.hotelName} is confirmed! Check-in: ${new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} | Check-out: ${new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} | Amount paid: ₹${amount}`,
        type: "booking_confirmed",
        bookingId: booking._id,
      });
    } catch (err) {
      console.warn("Booking confirmed notification failed:", err.message);
    }

    // ✅ 2. Room available notification — reminds user when checkout is near
    try {
      const hotel = await Hotel.findById(booking.hotelId);
      const checkOutDate = new Date(booking.checkOut);
      const now = new Date();
      const daysUntilCheckout = Math.ceil((checkOutDate - now) / (1000 * 60 * 60 * 24));

      // Only send if checkout is within 30 days (avoids noise for far-future bookings)
      if (daysUntilCheckout <= 30 && hotel) {
        await createNotification({
          userEmail: booking.email,
          title: "Room Available 🏨",
          message: `Your room at ${booking.hotelName} is ready! Check-in on ${new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Enjoy your stay! ${hotel.amenities?.length ? `Amenities: ${hotel.amenities.slice(0, 3).join(", ")}` : ""}`,
          type: "room_available",
          bookingId: booking._id,
        });
      }
    } catch (err) {
      console.warn("Room available notification failed:", err.message);
    }

    // ✅ 3. Send confirmation email with PDF
    try {
      const pdfBuffer = await generateInvoicePDF({
        orderNumber: payment.orderNumber,
        razorpayPaymentId: razorpay_payment_id,
        name: booking.name,
        email: booking.email,
        hotelName: booking.hotelName,
        rooms: booking.rooms,
        guests: booking.guests,
        nights: booking.nights,
        amount: amount,
        createdAt: payment.createdAt,
      });

      await sendPaymentConfirmation({
        to: booking.email,
        userName: booking.name,
        hotel: {
          name: booking.hotelName,
          location: "",
          price: Math.round(amount / booking.nights),
        },
        booking: {
          bookingId: payment._id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          amount: amount,
          nights: booking.nights,
          paymentId: razorpay_payment_id,
          paymentDate: payment.createdAt,
        },
        pdfBuffer,
      });
    } catch (emailErr) {
      console.warn("Payment email failed:", emailErr.message);
    }

    res.json({ message: "Payment Successful" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBookingRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    payment.status = "refunded";
    payment.refundDate = new Date();
    payment.refundAmount = payment.amount;
    await payment.save();

    // ✅ Refund notification
    try {
      await createNotification({
        userEmail: payment.email,
        title: "Refund Processed 💰",
        message: `Your refund of ₹${payment.amount} for booking at ${payment.hotelName} has been processed successfully.`,
        type: "general",
        bookingId: payment.bookingId,
      });
    } catch (err) {
      console.warn("Refund notification failed:", err.message);
    }

    res.json({ success: true, message: "Refund successful" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Refund failed" });
  }
};