const mongoose = require("mongoose");

const ownerRequestSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerEmail: { type: String, required: true },
  ownerName: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "add_hotel",       // owner wants to list a new hotel
      "update_hotel",    // owner wants to change hotel details
      "delete_hotel",    // owner wants to remove hotel
      "cancel_booking",  // owner wants to cancel a guest booking
      "room_availability", // owner wants to change room count
    ],
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    default: null,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null,
  },
  details: {
   type: mongoose.Schema.Types.Mixed,
  default: {},  
  },
  reason: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNote: { type: String }, // admin's response note
  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.OwnerRequest ||
  mongoose.model("OwnerRequest", ownerRequestSchema);