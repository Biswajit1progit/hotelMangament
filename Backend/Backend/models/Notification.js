const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ✅ ADDED — userId for reliable querying by the logged-in user.
    // required: false so existing notifications and internal createNotification
    // calls (which only have userEmail) don't break. When a user fetches
    // their notifications, we try userId first and fall back to userEmail
    // for old records that don't have it yet.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Kept — still used by createNotification internally (called from
    // paymentController, bookingController, checkoutNotifier etc. which
    // only have the user's email, not their ObjectId). Also used as
    // fallback query for old notifications without userId.
    userEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["booking_confirmed", "room_available", "checkout_reminder", "general"],
      default: "general",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);