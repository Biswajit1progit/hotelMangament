 const Booking = require("../models/Booking");
const Razorpay = require("razorpay");
const Payment =require("../models/Payment");
 const { createNotification } = require("./notificationController");
  const Hotel = require("../models/hotel");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
 const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
     // ✅ Notify user: booking confirmed
    await createNotification({
      userEmail: savedBooking.email,
      title: "Booking Confirmed ✅",
      message: `Your booking at ${savedBooking.hotelName} is confirmed! Check-in: ${new Date(savedBooking.checkIn).toDateString()}, Check-out: ${new Date(savedBooking.checkOut).toDateString()}.`,
      type: "booking_confirmed",
      bookingId: savedBooking._id,
    });
    res.status(201).json({
      message: "Booking successful",
      data: savedBooking,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/* const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Refund payment
    await razorpay.payments.refund(payment.razorpayPaymentId);

    payment.status = "refunded";
    await payment.save();

    res.json({ message: "Booking cancelled & refunded successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; */


// ✅ CHECK AVAILABILITY — checks if rooms are free for given dates
/* const checkAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;
 
    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });
    }
 
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
 
    // Find overlapping bookings for this hotel
    const overlapping = await Booking.find({
      hotelId,
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });
 
    // Sum up rooms already booked in that period
    const bookedRooms = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);
 
    res.json({
      bookedRooms,
      isAvailable: true, // you can add hotel.totalRooms check here if you have that field
      overlappingBookings: overlapping.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; */
const checkAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, checkOut required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // ✅ Get hotel's total rooms
   
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    const totalRooms = hotel.rooms; // ✅ your field name

    // ✅ Find overlapping bookings
    const overlapping = await Booking.find({
      hotelId,
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    // ✅ Sum already booked rooms in that period
    const bookedRooms = overlapping.reduce((sum, b) => sum + (b.rooms || 1), 0);

    // ✅ Check if requested rooms fit
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
module.exports={createBooking, checkAvailability};