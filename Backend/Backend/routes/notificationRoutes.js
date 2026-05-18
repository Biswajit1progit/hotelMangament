const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// GET all notifications for a user
router.get("/:email", getNotifications);

// PATCH mark one as read
router.patch("/read/:id", markAsRead);

// PATCH mark all as read
router.patch("/read-all/:email", markAllAsRead);

// DELETE one notification
router.delete("/:id", deleteNotification);

module.exports = router;