const jwt = require("jsonwebtoken")

// Tries to verify JWT but never blocks — attaches req.user if valid, null if guest
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null  // guest
    return next()
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // { id, email, role }
  } catch {
    req.user = null     // expired/invalid token → treat as guest
  }

  next()
}

module.exports = { optionalAuth }