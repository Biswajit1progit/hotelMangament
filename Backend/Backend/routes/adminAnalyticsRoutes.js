 // ─────────────────────────────────────────────────────────────
// backend/routes/adminAnalyticsRoutes.js
// Add to server.js: app.use("/api/admin", adminAnalyticsRoutes)
// (already registered since we use same /api/admin prefix)
// ─────────────────────────────────────────────────────────────

const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Hotel = require("../models/hotel")
const Booking = require("../models/Booking")
const Payment = require("../models/Payment")
const Review = require("../models/Revie") // adjust if your file is named differently
const User = require("../models/User")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

// ── GET /api/admin/analytics/hotels ──────────────────────────
// All hotels with booking stats + pie chart data
router.get("/analytics/hotels", verifyToken, async (req, res) => {
  try {
    const hotels = await Hotel.find({})

    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        // Total bookings for this hotel
        const totalBookings = await Booking.countDocuments({ hotelId: hotel._id })

        // Cancelled = payments with status "refunded" for this hotel
        const cancelledPayments = await Payment.countDocuments({
          hotelName: hotel.name,
          status: "refunded",
        })

        // Confirmed = payments with status "success"
        const confirmedPayments = await Payment.countDocuments({
          hotelName: hotel.name,
          status: "success",
        })

        // Total revenue
        const revenueData = await Payment.aggregate([
          { $match: { hotelName: hotel.name, status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        const revenue = revenueData[0]?.total || 0

        // Average rating
        const reviews = await Review.find({ hotelId: hotel._id })
        const avgRating = reviews.length
          ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : "N/A"

        return {
          _id: hotel._id,
          name: hotel.name,
          image: hotel.images?.[0] || null,
          location: `${hotel.district || ""}, ${hotel.state || ""}`,
          pricePerNight: hotel.pricePerNight,
          type: hotel.type,
          totalBookings,
          confirmedBookings: confirmedPayments,
          cancelledBookings: cancelledPayments,
          revenue,
          avgRating,
          reviewCount: reviews.length,
        }
      })
    )

    res.json(hotelsWithStats)
  } catch (err) {
    console.error("Analytics hotels error:", err)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/analytics/hotel/:id ───────────────────────
// Single hotel full breakdown — bookings, payments, reviews, users
router.get("/analytics/hotel/:id", verifyToken, async (req, res) => {
  try {
    const hotelId = req.params.id
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) return res.status(404).json({ error: "Hotel not found" })

    // All bookings for this hotel
    const bookings = await Booking.find({ hotelId }).sort({ createdAt: -1 })

    // All payments for this hotel
    const payments = await Payment.find({ hotelName: hotel.name }).sort({ createdAt: -1 })

    // All reviews for this hotel
    const reviews = await Review.find({ hotelId }).populate("userId", "name email").sort({ createdAt: -1 })

    // Merge booking + payment data
    const bookingDetails = await Promise.all(
      bookings.map(async (b) => {
        const payment = await Payment.findOne({ bookingId: b._id })
        const user = await User.findOne({ email: b.email }).select("_id name email role")
        return {
          _id: b._id,
          userName: b.name,
          userEmail: b.email,
          userId: user?._id,
          phone: b.phone,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          nights: b.nights,
          rooms: b.rooms,
          guests: b.guests,
          totalPrice: b.totalPrice,
          paymentStatus: payment?.status || "pending",
          paymentId: payment?.razorpayPaymentId || "N/A",
          orderNumber: payment?.orderNumber || "N/A",
          createdAt: b.createdAt,
        }
      })
    )

    // Stats for pie chart
    const confirmed = bookingDetails.filter(b => b.paymentStatus === "success").length
    const cancelled = bookingDetails.filter(b => b.paymentStatus === "refunded").length
    const pending = bookingDetails.filter(b => b.paymentStatus === "pending").length

    // Revenue
    const revenue = payments
      .filter(p => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0)

    res.json({
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        image: hotel.images?.[0] || null,
        location: `${hotel.district || ""}, ${hotel.state || ""}`,
        pricePerNight: hotel.pricePerNight,
        type: hotel.type,
      },
      stats: {
        totalBookings: bookingDetails.length,
        confirmed,
        cancelled,
        pending,
        revenue,
        reviewCount: reviews.length,
        avgRating: reviews.length
          ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : "N/A",
      },
      bookings: bookingDetails,
      reviews: reviews.map(r => ({
        _id: r._id,
        userName: r.user || r.userId?.name || "Anonymous",
        userEmail: r.userId?.email || "",
        userId: r.userId?._id,
        rating: r.rating,
        text: r.text || r.comment,
        createdAt: r.createdAt,
      })),
    })
  } catch (err) {
    console.error("Hotel analytics error:", err)
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/admin/analytics/hotel/:id ────────────────────
// Delete hotel and all its bookings/reviews
router.delete("/analytics/hotel/:id", verifyToken, async (req, res) => {
  try {
    const hotelId = req.params.id
    await Hotel.findByIdAndDelete(hotelId)
    await Booking.deleteMany({ hotelId })
    await Review.deleteMany({ hotelId })
    res.json({ success: true, message: "Hotel deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/analytics/user/:id ────────────────────────
// All bookings by a specific user across all hotels
router.get("/analytics/user/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })

    const bookings = await Booking.find({ email: user.email }).sort({ createdAt: -1 })
    const bookingDetails = await Promise.all(
      bookings.map(async (b) => {
        const payment = await Payment.findOne({ bookingId: b._id })
        return {
          _id: b._id,
          hotelName: b.hotelName,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          nights: b.nights,
          totalPrice: b.totalPrice,
          paymentStatus: payment?.status || "pending",
          createdAt: b.createdAt,
        }
      })
    )

    res.json({ user, bookings: bookingDetails })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router