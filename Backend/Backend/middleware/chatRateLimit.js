 const rateLimit = require("express-rate-limit")

// Key: userId if logged in, else sessionId from body, else IP
const userKeyGenerator = (req) => {
  if (req.user?.id) return `user:${req.user.id}`
  return `guest:${req.body?.sessionId || req.ip}`
}

// Hourly limiter — logged-in: 20/hr, guest: 5/hr
const chatHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  keyGenerator: userKeyGenerator,
  max: (req) => (req.user?.id ? 20 : 5),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const isGuest = !req.user?.id
    res.status(429).json({
      error: "hourly_limit_reached",
      isGuest,
      message: isGuest
        ? "You've used your free hourly limit. Login to get 20 messages per hour!"
        : "You've sent too many messages this hour. Please wait before chatting again.",
      retryAfter: req.rateLimit.resetTime,
    })
  },
})

// Daily limiter — logged-in: 100/day, guest: 15/day
const chatDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  keyGenerator: userKeyGenerator,
  max: (req) => (req.user?.id ? 100 : 15),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const isGuest = !req.user?.id
    res.status(429).json({
      error: "daily_limit_reached",
      isGuest,
      message: isGuest
        ? "You've used your free daily limit. Login to get 100 messages per day!"
        : "You've reached your daily chat limit. Come back tomorrow!",
      retryAfter: req.rateLimit.resetTime,
    })
  },
})

module.exports = { chatHourlyLimiter, chatDailyLimiter }