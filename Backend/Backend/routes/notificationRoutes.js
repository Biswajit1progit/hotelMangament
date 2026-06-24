const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// ✅ FIXED — removed email from all URLs. Controller now reads
// req.user._id and req.user.email from the verified token instead.
//
// OLD routes (email in URL = spoofable):
//   GET    /api/notifications/:email
//   PATCH  /api/notifications/read-all/:email
//
// NEW routes (no email, identity from token):
//   GET    /api/notifications/me
//   PATCH  /api/notifications/read-all
//
// ⚠️ FRONTEND CHANGE NEEDED: update your notification service/API
// calls to use the new URLs — see note at bottom of this file.

router.get("/me", verifyToken, getNotifications);
router.patch("/read/:id", verifyToken, markAsRead);
router.patch("/read-all", verifyToken, markAllAsRead);
router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;

// ─── FRONTEND URLS TO UPDATE ────────────────────────────────
// Find wherever you call notification APIs in the frontend and
// update these:
//
// GET /api/notifications/${email}            →  GET /api/notifications/me
// PATCH /api/notifications/read-all/${email} →  PATCH /api/notifications/read-all
//
// The other two routes (/read/:id and /delete/:id) are unchanged.