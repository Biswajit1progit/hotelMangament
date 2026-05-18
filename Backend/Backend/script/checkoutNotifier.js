 /**
 * checkoutNotifier.js
 * 
 * Run this script with node-cron in your serve.js
 * OR run manually: node script/checkoutNotifier.js
 * 
 * It checks bookings whose checkOut date has just passed
 * and sends a "Room Now Available" notification to the user.
 */

const cron = require("node-cron");
const Booking = require("../models/Booking");
const { createNotification } = require("../controllers/notificationController");

const runCheckoutNotifier = () => {
  // ✅ Runs every hour
  cron.schedule("0 * * * *", async () => {
   

    try {
      const now = new Date();

      // Find bookings that checked out in the last 1 hour and not yet notified
      const recentCheckouts = await Booking.find({
        checkOut: {
          $gte: new Date(now - 60 * 60 * 1000), // 1 hour ago
          $lte: now,
        },
        checkoutNotified: { $ne: true }, // only if not already notified
      });

      for (const booking of recentCheckouts) {
        await createNotification({
          userEmail: booking.email,
          title: "Room Now Available 🏨",
          message: `Your stay at ${booking.hotelName} has ended. The room is now available again. We hope you enjoyed your stay! Book again anytime.`,
          type: "room_available",
          bookingId: booking._id,
        });

        // Mark as notified so we don't send twice
        booking.checkoutNotified = true;
        await booking.save();

       
      }
    } catch (err) {
      console.error("Checkout notifier error:", err.message);
    }
  });

  
};

module.exports = { runCheckoutNotifier };