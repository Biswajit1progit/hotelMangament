/**
 * showReminderNotifier.js
 *
 * Same pattern as checkoutNotifier.js — run via node-cron in server.js.
 *
 * Sends a "your show is today" reminder (notification + email) to users
 * whose confirmed MovieBooking has a showDate matching today, once per
 * booking (guarded by reminderSent, same idea as checkoutNotified).
 */

const cron = require("node-cron");
const MovieBooking = require("../models/Moviebooking");
const { createNotification } = require("../controllers/notificationController");
const { sendShowReminder } = require("../service/emailService"); // singular "service", matching your existing require paths

const runShowReminderNotifier = () => {
  // Runs every hour, same cadence as checkoutNotifier — catches bookings
  // for shows happening later today regardless of what time someone
  // booked or what time the cron happens to run.
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const todaysShows = await MovieBooking.find({
        status: "confirmed",
        showDate: { $gte: startOfToday, $lte: endOfToday },
        reminderSent: { $ne: true },
      });

      for (const booking of todaysShows) {
        try {
          await createNotification({
            userEmail: booking.email,
            userId: booking.userId,
            title: "Show Today 🍿",
            message: `Reminder: ${booking.movieTitle} at ${booking.theaterName} today at ${booking.showTime}. Seats: ${booking.seats.join(", ")}.`,
            type: "movie_show_reminder",
            bookingId: booking._id,
            domain: "movie", // NEW
          });
        } catch (err) {
          console.warn(`Show reminder notification failed for booking ${booking._id}:`, err.message);
        }

        try {
          await sendShowReminder({
            to: booking.email,
            userName: booking.name,
            booking,
          });
        } catch (err) {
          console.warn(`Show reminder email failed for booking ${booking._id}:`, err.message);
        }

        booking.reminderSent = true;
        await booking.save();
      }
    } catch (err) {
      console.error("Show reminder notifier error:", err.message);
    }
  });
};

module.exports = { runShowReminderNotifier };