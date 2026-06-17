 const cron = require("node-cron")
const Booking = require("../models/Booking")
const { createNotification } = require("../controllers/notificationController")

// ── Runs every day at midnight ────────────────────────────────
// Checks all bookings whose checkout date just passed
// and sends a "room now available" post-stay notification

cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running checkout notification cron...")

  try {
    const now = new Date()

    // Find bookings that checked out in the last 24 hours
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const completedBookings = await Booking.find({
      checkOut: { $gte: yesterday, $lte: now },
      checkoutNotified: { $ne: true }, // ✅ don't send twice
    })

    console.log(`   Found ${completedBookings.length} completed stays`)

    for (const booking of completedBookings) {
      try {
        await createNotification({
          userEmail: booking.email,
          title: "Room Now Available 🏨",
          message: `Your stay at ${booking.hotelName} has ended. The room is now available again. We hope you enjoyed your stay! Book again anytime.`,
          type: "room_available",
          bookingId: booking._id,
        })

        // ✅ Mark as notified so cron doesn't send again tomorrow
        booking.checkoutNotified = true
        await booking.save()

        console.log(`   ✓ Notified ${booking.email} — ${booking.hotelName}`)
      } catch (err) {
        console.warn(`   ⚠️ Failed for ${booking.email}:`, err.message)
      }
    }

    console.log("✓ Checkout cron done")
  } catch (err) {
    console.error("❌ Checkout cron error:", err.message)
  }
})

module.exports = {}