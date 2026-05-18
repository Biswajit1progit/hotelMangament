const Notification = require("../models/Notification");

// ✅ Get all notifications for a user by email
const getNotifications = async (req, res) => {
  try {
    const { email } = req.params;
    const notifications = await Notification.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Mark ALL notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const { email } = req.params;
    await Notification.updateMany({ userEmail: email }, { isRead: true });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a notification (internal use + route)
const createNotification = async ({ userEmail, title, message, type, bookingId }) => {
  try {
    const notification = new Notification({ userEmail, title, message, type, bookingId });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

// ✅ Delete a notification
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