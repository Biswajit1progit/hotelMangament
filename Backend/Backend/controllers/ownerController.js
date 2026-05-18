const OwnerRequest = require("../models/OwnerRequest");
const Booking = require("../models/Booking");
const Hotel = require("../models/hotel");

// ✅ Get owner's hotel (assumes one hotel per owner for now)
const getMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ ownerId: req.user._id });
    if (!hotel) return res.status(404).json({ message: "No hotel found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all bookings for owner's hotel
const getMyBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ ownerId: req.user._id });
    if (!hotel) return res.status(404).json({ message: "No hotel found" });

    const bookings = await Booking.find({ hotelId: hotel._id })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get owner dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ ownerId: req.user._id });
    if (!hotel) return res.json({
      totalBookings: 0, totalRevenue: 0,
      occupiedRooms: 0, totalRooms: 0,
      pendingRequests: 0, recentBookings: []
    });

    const bookings = await Booking.find({ hotelId: hotel._id });
    const now = new Date();

    // Active bookings (checked in, not yet checked out)
    const activeBookings = bookings.filter(b =>
      new Date(b.checkIn) <= now && new Date(b.checkOut) >= now
    );
    const occupiedRooms = activeBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const pendingRequests = await OwnerRequest.countDocuments({
      ownerId: req.user._id,
      status: "pending",
    });

    res.json({
      totalBookings: bookings.length,
      totalRevenue,
      occupiedRooms,
      totalRooms: hotel.rooms || 0,
      availableRooms: (hotel.rooms || 0) - occupiedRooms,
      pendingRequests,
      hotelName: hotel.name,
      recentBookings: bookings.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Submit a request to admin
const submitRequest = async (req, res) => {
  try {
    const { type, hotelId, bookingId, details, reason } = req.body;

    const request = await OwnerRequest.create({
      ownerId: req.user._id,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
      type,
      hotelId: hotelId || null,
      bookingId: bookingId || null,
      details,
      reason,
    });

    res.status(201).json({ message: "Request submitted successfully", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all requests submitted by this owner
const getMyRequests = async (req, res) => {
  try {
    const requests = await OwnerRequest.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyHotel,
  getMyBookings,
  getDashboardStats,
  submitRequest,
  getMyRequests,
};