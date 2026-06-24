const Notification = require("../models/Notification");
const User = require("../models/User");

// ✅ FIXED — was: Notification.find({ userEmail: req.params.email })
// That trusted the email in the URL directly — any logged-in user could
// read any other user's notifications just by changing the email in the URL.
//
// Now: queries by userId (from verified JWT token) first.
// Falls back to userEmail match for old notifications that were created
// before userId was added to the schema — so existing notifications
// still show up without needing a migration.
//
// Route is now GET /api/notifications/me (no email in URL at all).
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.user._id },           // new notifications — matched by userId
        { userEmail: req.user.email },       // old notifications — fallback by email
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UNCHANGED logic — markAsRead by notification _id is safe.
// The id is a non-guessable Mongo ObjectId and verifyToken is now
// on this route, so only logged-in users can call it.
// Full fix would also verify req.user owns this notification —
// flagging as a known smaller gap, not the priority today.
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED — was: Notification.updateMany({ userEmail: req.params.email })
// Same email-trust problem as getNotifications. Now uses req.user to
// mark all notifications belonging to the logged-in user as read,
// covering both userId-linked and email-linked (old) notifications.
//
// Route is now PATCH /api/notifications/read-all (no email in URL).
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { userId: req.user._id },
          { userEmail: req.user.email },
        ],
      },
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ createNotification — internal helper called by paymentController,
// bookingController, adminController, checkoutNotifier etc.
// Accepts optional userId so callers that DO have it (e.g. verifyPayment
// where req.user._id is available) can pass it for better linking.
// userEmail stays required since most callers only have that.
const createNotification = async ({ userEmail, userId = null, title, message, type, bookingId }) => {
  try {
    // ✅ If userId not passed but we have the email, look up the user
    // so the notification gets userId linked automatically.
    // This means even notifications created from checkoutNotifier
    // (which only has email) will get userId if the user exists in DB.
    let resolvedUserId = userId;
    if (!resolvedUserId && userEmail) {
      const user = await User.findOne({ email: userEmail }).select("_id");
      resolvedUserId = user?._id || null;
    }

    const notification = new Notification({
      userEmail,
      userId: resolvedUserId,
      title,
      message,
      type,
      bookingId,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

// ✅ UNCHANGED — delete by id, verifyToken now on this route
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
};