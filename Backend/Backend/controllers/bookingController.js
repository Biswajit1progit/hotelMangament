const Booking = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Hotel = require("../models/hotel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Notification removed — fires after payment instead (paymentController.js)
const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking successful",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    const totalRooms = hotel.rooms;

    const overlapping = await Booking.find({
      hotelId,
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    const bookedRooms = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
    const requestedRooms = Number(rooms) || 1;
    const remainingRooms = totalRooms - bookedRooms;
    const isAvailable = remainingRooms >= requestedRooms;

    res.json({
      totalRooms,
      bookedRooms,
      remainingRooms,
      requestedRooms,
      isAvailable,
      overlappingBookings: overlapping.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createBooking, checkAvailability };