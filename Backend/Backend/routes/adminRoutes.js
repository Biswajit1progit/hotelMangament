const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllRequests,
  resolveRequest,
  getAllHotels,
  getAllUsers,
  deleteUser,
  getAllBookings,
} = require("../controllers/adminController");

router.get("/dashboard", verifyAdmin, getDashboardStats);
router.get("/requests", verifyAdmin, getAllRequests);
router.patch("/requests/:id", verifyAdmin, resolveRequest);
router.get("/hotels", verifyAdmin, getAllHotels);
router.get("/users", verifyAdmin, getAllUsers);
router.delete("/users/:id", verifyAdmin, deleteUser);
router.get("/bookings", verifyAdmin, getAllBookings);

module.exports = router;