 const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: false, // false so old bookings don't break
},
  name: {
    type: String,
    required: true,
  },
  hotelName:{
   type:String,
   required:true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  rooms: {
    type: Number,
    default: 1,
  },
  specialRequests: {
    type: String,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  nights:{
    type:Number,
    required:true,
  },
  checkoutNotified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);