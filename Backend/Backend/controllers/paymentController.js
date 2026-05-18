 const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking=require("../models/Booking");
const { verifySignature } = require("../utils/verifySignature");
const generateOrderId = require("../utils/generateOrderId");
const path = require("path");
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

// Save payment
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

    // 🔐 USE UTIL FUNCTION HERE
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ success: false });
    }

    const data = req.body;
    const booking = await Booking.findById(data.bookingId);
    console.log("Booking Details:",booking);
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

    // Generate PDF
/* const filePath = path.join(__dirname, `../uploads/${payment.orderNumber}.pdf`);
generateInvoicePDF(payment, filePath); */

// Send Email


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
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    payment.status = "refunded";
    payment.refundDate = new Date();
    payment.refundAmount = payment.amount;

    await payment.save();

    res.json({
      success: true,
      message: "Refund successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Refund failed"
    });
  }
};