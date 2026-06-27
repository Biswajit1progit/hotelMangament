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
// ✅ ALSO FIXED (controller-level, no route signature change needed):
// /read/:id and /delete/:id used to trust req.params.id alone, with no
// check that the notification belonged to req.user. That's IDOR — fixed
// in notificationController.js by scoping the update/delete query to
// (_id AND (userId OR userEmail) === req.user). Route paths below are
// unchanged since the fix lives entirely in the controller's query.

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
// The other two routes (/read/:id and /delete/:id) keep the same URL
// shape as before — only the controller's internal query changed to
// add the ownership check, so no frontend changes needed for those two.