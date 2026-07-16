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
      enum: ["booking_confirmed", "room_available", "checkout_reminder", "general", "movie_booking_confirmed",
    "movie_show_reminder"],
      default: "general",
    },

    // NEW — separates "which feature this notification is about" from
    // "what kind of event it is" (the `type` field above). Adding a new
    // feature (flights, events) going forward only means adding one value
    // here once, instead of inventing new type values like
    // "flight_booking_confirmed", "flight_departure_reminder", etc. every
    // time — avoids the enum growing combinatorially as features multiply.
    // default: "hotel" so every existing notification (created before this
    // field existed) is automatically correct with zero migration needed.
    domain: {
      type: String,
      enum: ["hotel", "movie", "flight", "event", "system"],
      default: "hotel",
    },

    // NOTE: this ref always points at "Booking" (the hotel model), even
    // for movie notifications where bookingId actually holds a
    // MovieBooking _id. Storage works fine either way since Mongoose
    // ObjectIds aren't type-checked against the ref at write time — this
    // only matters if you ever call .populate("bookingId") somewhere,
    // which would silently return null for movie notifications since it
    // would look in the wrong collection. If you add .populate() later,
    // switch this to a refPath keyed off `domain` instead of a fixed ref.
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