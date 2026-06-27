const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Hotel = require("../models/hotel")
const Booking = require("../models/Booking")
const Payment = require("../models/Payment")
const Review = require("../models/Revie")
const User = require("../models/User")
const { verifyAdmin } = require("../middleware/authMiddleware")

// ── GET /api/admin/analytics/hotels ──────────────────────────
router.get("/analytics/hotels", verifyAdmin, async (req, res) => {
  try {
    const hotels = await Hotel.find({})

    const hotelsWithStats = await Promise.all(
      hotels.map(async (hotel) => {
        // ── Booking counts ────────────────────────────────────
        const totalBookings = await Booking.countDocuments({ hotelId: hotel._id })

        const cancelledPayments = await Payment.countDocuments({
          hotelName: hotel.name,
          status: "refunded",
        })
        const confirmedPayments = await Payment.countDocuments({
          hotelName: hotel.name,
          status: "success",
        })

        // ── Revenue ───────────────────────────────────────────
        const revenueData = await Payment.aggregate([
          { $match: { hotelName: hotel.name, status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        const revenue = revenueData[0]?.total || 0

        // ── Occupancy rate ────────────────────────────────────
        const occupancyRate = totalBookings > 0
          ? Math.round((confirmedPayments / totalBookings) * 100)
          : 0

        // ── Reviews ───────────────────────────────────────────
        const reviews = await Review.find({ hotelId: hotel._id })
        const reviewCount = reviews.length
        const avgRating = reviewCount
          ? parseFloat(
              (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
            )
          : null

        // ── bookingHistory: last 12 months ────────────────────
        // Aggregates ALL bookings (by createdAt) for this hotel
        // into month buckets so the trend chart works.
        const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"]
        const now = new Date()

        // Build ordered skeleton for the last 12 months
        const skeleton = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
          return {
            month:    MONTHS[d.getMonth()],
            year:     d.getFullYear(),
            bookings: 0,
          }
        })

        // One aggregation query — group by year+month
        const bookingAgg = await Booking.aggregate([
          {
            $match: {
              hotelId: hotel._id,
              createdAt: {
                // only last 12 months
                $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
              },
            },
          },
          {
            $group: {
              _id: {
                year:  { $year:  "$createdAt" },
                month: { $month: "$createdAt" }, // 1-indexed
              },
              count: { $sum: 1 },
            },
          },
        ])

        // Merge aggregation results into skeleton
        bookingAgg.forEach(({ _id, count }) => {
          const monthName = MONTHS[_id.month - 1] // convert 1-indexed → name
          const idx = skeleton.findIndex(
            s => s.month === monthName && s.year === _id.year
          )
          if (idx !== -1) skeleton[idx].bookings = count
        })

        const bookingHistory = skeleton // already ordered oldest → newest

        // ── Booking trend: % change vs prior month ────────────
        const thisMonth = skeleton[11]?.bookings || 0
        const lastMonth = skeleton[10]?.bookings || 0
        const bookingTrend =
          lastMonth === 0
            ? null
            : Math.round(((thisMonth - lastMonth) / lastMonth) * 100)

        return {
          _id:              hotel._id,
          name:             hotel.name,
          image:            hotel.images?.[0] || null,
          location:         `${hotel.district || ""}, ${hotel.state || ""}`,
          pricePerNight:    hotel.pricePerNight,
          type:             hotel.type,
          totalBookings,
          confirmedBookings: confirmedPayments,
          cancelledBookings: cancelledPayments,
          revenue,
          occupancyRate,
          avgRating,
          reviewCount,
          bookingHistory, // ← required by BookingsTrendChart
          bookingTrend,   // ← required by TrendBadge
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
router.get("/analytics/hotel/:id", verifyAdmin, async (req, res) => {
  try {
    const hotelId = req.params.id
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) return res.status(404).json({ error: "Hotel not found" })

    const bookings = await Booking.find({ hotelId }).sort({ createdAt: -1 })
    const payments = await Payment.find({ hotelName: hotel.name }).sort({ createdAt: -1 })
    const reviews  = await Review.find({ hotelId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })

    const bookingDetails = await Promise.all(
      bookings.map(async (b) => {
        const payment = await Payment.findOne({ bookingId: b._id })
        const user    = await User.findOne({ email: b.email }).select("_id name email role")
        return {
          _id:           b._id,
          userName:      b.name,
          userEmail:     b.email,
          userId:        user?._id,
          phone:         b.phone,
          checkIn:       b.checkIn,
          checkOut:      b.checkOut,
          nights:        b.nights,
          rooms:         b.rooms,
          guests:        b.guests,
          totalPrice:    b.totalPrice,
          paymentStatus: payment?.status || "pending",
          paymentId:     payment?.razorpayPaymentId || "N/A",
          orderNumber:   payment?.orderNumber || "N/A",
          createdAt:     b.createdAt,
        }
      })
    )

    const confirmed = bookingDetails.filter(b => b.paymentStatus === "success").length
    const cancelled = bookingDetails.filter(b => b.paymentStatus === "refunded").length
    const pending   = bookingDetails.filter(b => b.paymentStatus === "pending").length
    const revenue   = payments
      .filter(p => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0)

    res.json({
      hotel: {
        _id:          hotel._id,
        name:         hotel.name,
        image:        hotel.images?.[0] || null,
        location:     `${hotel.district || ""}, ${hotel.state || ""}`,
        pricePerNight: hotel.pricePerNight,
        type:         hotel.type,
      },
      stats: {
        totalBookings: bookingDetails.length,
        confirmed,
        cancelled,
        pending,
        revenue,
        reviewCount: reviews.length,
        avgRating:   reviews.length
          ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
          : "N/A",
      },
      bookings: bookingDetails,
      reviews: reviews.map(r => ({
        _id:       r._id,
        userName:  r.user || r.userId?.name || "Anonymous",
        userEmail: r.userId?.email || "",
        userId:    r.userId?._id,
        rating:    r.rating,
        text:      r.text || r.comment,
        createdAt: r.createdAt,
      })),
    })
  } catch (err) {
    console.error("Hotel analytics error:", err)
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/admin/analytics/hotel/:id ────────────────────
router.delete("/analytics/hotel/:id", verifyAdmin, async (req, res) => {
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
router.get("/analytics/user/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ error: "User not found" })

    const bookings = await Booking.find({ email: user.email }).sort({ createdAt: -1 })
    const bookingDetails = await Promise.all(
      bookings.map(async (b) => {
        const payment = await Payment.findOne({ bookingId: b._id })
        return {
          _id:           b._id,
          hotelName:     b.hotelName,
          checkIn:       b.checkIn,
          checkOut:      b.checkOut,
          nights:        b.nights,
          totalPrice:    b.totalPrice,
          paymentStatus: payment?.status || "pending",
          createdAt:     b.createdAt,
        }
      })
    )

    res.json({ user, bookings: bookingDetails })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router