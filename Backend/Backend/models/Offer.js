const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      sparse: true, // allows multiple docs with no code (auto-apply offers)
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scope: {
      type: String,
      enum: ["platform", "hotel"],
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null, // required only when scope === "hotel"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // cap for percentage discounts
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    // NEW: restrict offer to specific payment methods
    applicableMethods: {
      type: [String],
      enum: ["card", "upi", "netbanking", "wallet", "any"],
      default: ["any"],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTill: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Validation: hotel scope must have a hotel reference
offerSchema.pre("validate", function () {
  if (this.scope === "hotel" && !this.hotel) {
    throw new Error("hotel is required when scope is 'hotel'");
  }

  if (this.scope === "platform" && this.hotel) {
    throw new Error("hotel must be null when scope is 'platform'");
  }

  if (this.validFrom >= this.validTill) {
    throw new Error("validFrom must be before validTill");
  }

  if (!this.applicableMethods || this.applicableMethods.length === 0) {
    this.applicableMethods = ["any"];
  }
});

offerSchema.index({ scope: 1, hotel: 1, isActive: 1 });

module.exports = mongoose.model("Offer", offerSchema);