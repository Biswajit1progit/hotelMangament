const mongoose = require("mongoose");

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    location: { lat: Number, lng: Number }, // enables "theaters near this hotel" distance queries later
    screens: { type: Number, default: 1, min: 1 }, // how many screens this theater has
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who added it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theater", theaterSchema);