 const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {                      // ✅ MUST EXIST
    type: String,
    required: true,
  },
  user: String,
  rating: Number,
  comment: String,
}, { timestamps: true });

module.exports = mongoose.model("Revie", reviewSchema);