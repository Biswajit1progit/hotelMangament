const mongoose = require("mongoose");

// Stores active refresh tokens so we can:
// 1. Invalidate on logout
// 2. Detect token reuse (rotation theft detection)
const refreshTokenSchema = new mongoose.Schema(
  {
    token:     { type: String, required: true, unique: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // family: rotating tokens belong to the same family.
    // If an old (already-rotated) token is used, we invalidate the whole family
    // — this detects refresh token theft.
    family:    { type: String, required: true },
    used:      { type: Boolean, default: false },   // true once rotated
    expiresAt: { type: Date,    required: true },
  },
  { timestamps: true }
);

// Auto-delete expired tokens from DB (MongoDB TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);