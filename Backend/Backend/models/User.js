 const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["user", "admin", "hotelOwner"],
    default: "user",
  },
  // ❤️ NEW FIELD
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);