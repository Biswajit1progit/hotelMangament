const express = require("express");
const router = express.Router();
const { verifyOwner } = require("../middleware/authMiddleware");
const {
  getMyHotel,
  getMyBookings,
  getDashboardStats,
  submitRequest,
  getMyRequests,
} = require("../controllers/ownerController");

router.get("/dashboard", verifyOwner, getDashboardStats);
router.get("/hotel", verifyOwner, getMyHotel);
router.get("/bookings", verifyOwner, getMyBookings);
router.post("/request", verifyOwner, submitRequest);
router.get("/requests", verifyOwner, getMyRequests);

module.exports = router;