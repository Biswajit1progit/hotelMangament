const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true }, // e.g. "A1", "B12"
    row: { type: String, required: true },        // e.g. "A"
    col: { type: Number, required: true },         // e.g. 1
    seatType: { type: String, enum: ["standard", "premium"], default: "standard" },
    price: { type: Number, required: true },       // allows premium rows to cost more than standard
    status: { type: String, enum: ["available", "booked"], default: "available" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "MovieBooking", default: null },
  },
  { _id: false } // seats don't need their own _id, seatNumber is unique within a show
);

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", required: true },
    screenNumber: { type: Number, default: 1 },
    showDate: { type: Date, required: true },   // date only (time-of-day zeroed), for querying "shows on this day"
    showTime: { type: String, required: true }, // e.g. "18:30" — stored separately from date for simple display/sort
    seats: { type: [seatSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Fast lookup: "all shows for this movie", "all shows at this theater on this date"
showSchema.index({ movie: 1, showDate: 1 });
showSchema.index({ theater: 1, showDate: 1 });

module.exports = mongoose.model("Show", showSchema); 