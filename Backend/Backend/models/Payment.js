const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // false so old payments without it don't break
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "wallet"], // NOTE: added "wallet" — offer.applicableMethods supports it, this didn't
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    default: "pending",
  },
  orderNumber: {
  type: String,
  unique: true,
},  

   // 🏨 SNAPSHOT DATA (IMPORTANT)
  hotelName: String,
  guests: Number,
  rooms: Number,
  nights: Number,

  // 👤 USER INFO (optional but useful)
  name: String,
  email: String,
  phone:Number,

  status: {
  type: String,
  enum: ["pending", "success", "refunded"],
  default: "pending"
},

refundDate: Date,
refundAmount: Number,

// 🎟️ OFFER DATA (NEW)
discountApplied: {
  type: Number,
  default: 0,
},
  
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);