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

// ✅ FIXED — was: Notification.findByIdAndUpdate(req.params.id, ...)
// That only checked the notification existed — NOT that it belonged to
// the logged-in user. An ObjectId being "non-guessable" doesn't matter
// once a user has SEEN any notification ID through normal app use
// (network tab, API response, bug report, etc). Any authenticated user
// could mark ANY other user's notification as read just by changing the
// id in the URL — classic IDOR, even with verifyToken in front of it.
//
// Now: ownership is enforced INSIDE the query itself (_id AND
// (userId OR userEmail) match), as one atomic operation. If the
// notification doesn't exist OR doesn't belong to this user, we return
// the same 404 either way — we deliberately don't distinguish
// "doesn't exist" from "exists but isn't yours", since that distinction
// itself would leak information to an attacker probing IDs.
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ userId: req.user._id }, { userEmail: req.user.email }],
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Marked as read", notification });
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

// ✅ FIXED — was: Notification.findByIdAndDelete(req.params.id)
// Same IDOR pattern as markAsRead — deletion by ID alone, no ownership
// check. This was actually the highest-risk of the two, since delete is
// destructive and irreversible: any logged-in user could permanently
// delete any other user's notification just by knowing/guessing its id.
//
// Now: ownership enforced inside the query itself, same pattern as
// markAsRead above. Same 404-for-both-cases reasoning applies.
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { userEmail: req.user.email }],
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

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