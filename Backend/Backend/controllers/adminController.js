const OwnerRequest = require("../models/OwnerRequest");
const Hotel = require("../models/hotel");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// ✅ Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "hotelOwner" });
    const totalBookings = await Booking.countDocuments();
    const pendingRequests = await OwnerRequest.countDocuments({ status: "pending" });

    const revenueData = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const recentRequests = await OwnerRequest.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalHotels,
      totalUsers,
      totalOwners,
      totalBookings,
      pendingRequests,
      totalRevenue,
      recentRequests,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all pending owner requests
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await OwnerRequest.find(filter)
      .populate("hotelId", "name district")
      .populate("bookingId", "name email checkIn checkOut")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Approve or reject a request + apply changes
const resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body; // status: "approved" or "rejected"

    const request = await OwnerRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.adminNote = adminNote || "";
    request.resolvedAt = new Date();
    await request.save();

    // ✅ If approved — apply the changes automatically
    if (status === "approved") {
      switch (request.type) {

        case "add_hotel": {

  const newHotel = await Hotel.create({
    ...request.details,
    ownerId: request.ownerId,
    pricePerNight: Number(request.details.pricePerNight),
    rooms: Number(request.details.rooms),
  });
  break;
}

        case "update_hotel":
          if (request.hotelId) {
            await Hotel.findByIdAndUpdate(request.hotelId, request.details);
          }
          break;

        case "delete_hotel":
          if (request.hotelId) {
            await Hotel.findByIdAndDelete(request.hotelId);
          }
          break;

        case "cancel_booking":{
           if (request.bookingId) {
            const booking = await Booking.findById(request.bookingId);
            if (booking) {
              // Notify guest
              await createNotification({
                userEmail: booking.email,
                title: "Booking Cancelled",
                message: `Your booking at ${booking.hotelName} has been cancelled. Reason: ${request.reason || "Hotel request"}`,
                type: "general",
                bookingId: booking._id,
              });
              await Booking.findByIdAndDelete(request.bookingId);
            }
          }
          break;
        }
         

        case "room_availability":
          if (request.hotelId && request.details.rooms) {
            await Hotel.findByIdAndUpdate(request.hotelId, {
              rooms: request.details.rooms,
            });
          }
          break;
      }
    }

    // ✅ Notify owner of decision
    await createNotification({
      userEmail: request.ownerEmail,
      title: status === "approved" ? "Request Approved ✅" : "Request Rejected ❌",
      message: `Your ${request.type.replace("_", " ")} request has been ${status}.${adminNote ? ` Admin note: ${adminNote}` : ""}`,
      type: "general",
    });

    res.json({ message: `Request ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all hotels
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllRequests,
  resolveRequest,
  getAllHotels,
  getAllUsers,
  deleteUser,
  getAllBookings,
};