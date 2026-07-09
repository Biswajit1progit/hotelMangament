const mongoose = require("mongoose");

const offerRedemptionSchema = new mongoose.Schema(
  {
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    discountApplied: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevents double-counting redemption for the exact same booking
offerRedemptionSchema.index({ offer: 1, booking: 1 }, { unique: true });
offerRedemptionSchema.index({ offer: 1, user: 1 });

module.exports = mongoose.model("OfferRedemption", offerRedemptionSchema);