const jwt  = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     "/api/auth",
};

// ── normaliseUser ─────────────────────────────────────────────────────────────
// The old verifyToken did User.findById() → returned a Mongoose document
// where the user id lived at req.user._id (ObjectId).
// The new verifyToken decodes the JWT payload directly → plain JS object
// where the id lives at req.user.id (string from jwt.sign({ id: user._id })).
//
// Any controller written against the old middleware used req.user._id.
// Rather than hunting every controller, we normalise the decoded payload
// here once — adding ._id as an alias for .id so BOTH work everywhere.
// This means req.user.id and req.user._id are identical strings after this.
const normaliseUser = (decoded) => ({
  ...decoded,
  id:  decoded.id,       // string  — new style  (req.user.id)
  _id: decoded.id,       // alias   — old style  (req.user._id) ← backward compat
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided", code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = normaliseUser(decoded);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ message: "Invalid token", code: "INVALID_TOKEN" });
  }
};

const verifyOwner = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided", code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "hotelOwner")
      return res.status(403).json({ message: "Access denied. Owner only." });
    req.user = normaliseUser(decoded);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ message: "Invalid token", code: "INVALID_TOKEN" });
  }
};

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided", code: "NO_TOKEN" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admin only." });
    req.user = normaliseUser(decoded);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ message: "Invalid token", code: "INVALID_TOKEN" });
  }
};

module.exports = { verifyToken, verifyOwner, verifyAdmin, REFRESH_COOKIE_OPTIONS };