const express = require("express");
const router = express.Router();

const {
  reserveSeats,
  cancelReservation,
  createMovieOrder,
  verifyMoviePayment,
  getUserMovieBookings,
  getMovieBookingById,
  downloadInvoice,
} = require("../controllers/movieBookingController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/reserve", verifyToken, reserveSeats);
router.delete("/:id/cancel", verifyToken, cancelReservation);
router.post("/order", verifyToken, createMovieOrder);
router.post("/verify", verifyToken, verifyMoviePayment);
router.get("/my", verifyToken, getUserMovieBookings);
router.get("/:id/invoice", verifyToken, downloadInvoice);
router.get("/:id", verifyToken, getMovieBookingById);

module.exports = router; 