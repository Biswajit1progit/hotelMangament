const mongoose = require("mongoose");

const movieBookingSchema = new mongoose.Schema(
  {
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Snapshot fields — same principle as your Payment model's snapshot data.
    // Keeps the booking readable even if the Movie/Theater/Show later changes.
    movieTitle: { type: String, required: true },
    theaterName: { type: String, required: true },
    showDate: { type: Date, required: true },
    showTime: { type: String, required: true },

    seats: [{ type: String, required: true }], // seat numbers, e.g. ["A1", "A2"]
    totalPrice: { type: Number, required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "expired"],
      default: "pending_payment",
    },

    // Seat locks expire if payment isn't completed in time — see reserveSeats
    // in movieBookingController for how this is set/used.
    reservationExpiresAt: { type: Date },

    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieBooking", movieBookingSchema);