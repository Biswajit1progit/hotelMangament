const express = require("express")
const Groq = require("groq-sdk")
const mongoose = require("mongoose")
const { retrieveHotels } = require("../service/ragservices")
const Hotel = require("../models/hotel")
const { optionalAuth } = require("../middleware/optionalAuth")
const { chatHourlyLimiter, chatDailyLimiter } = require("../middleware/chatRateLimit")

const router = express.Router()

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const sessions = new Map()

// ── Risk 1: Prompt injection sanitizer ───────────────────────
const sanitizeMessage = (msg) => {
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+|above\s+)?instructions/i,
    /you\s+are\s+now\s+(dan|jailbreak|evil|unrestricted)/i,
    /reveal\s+(all\s+)?(user|owner|admin|email|password|secret)/i,
    /system\s*prompt/i,
    /forget\s+(all\s+)?instructions/i,
    /act\s+as\s+(if\s+)?(you\s+are\s+)?(?:dan|uncensored|unrestricted)/i,
  ]
  for (const pattern of injectionPatterns) {
    if (pattern.test(msg)) return null
  }
  return msg.slice(0, 500)
}

// ── Parse price/rating filters from natural language ──────────
const parseMessageFilters = (message) => {
  const query = {}
  const msg = message.toLowerCase()

  const maxPriceMatch = msg.match(
    /(?:under|below|less than|upto|up to)\s*[₹rs.]?\s*(\d+)/
  )
  if (maxPriceMatch) {
    query.pricePerNight = { ...query.pricePerNight, $lte: Number(maxPriceMatch[1]) }
  }

  const minPriceMatch = msg.match(
    /(?:above|more than|over|minimum|min)\s*[₹rs.]?\s*(\d+)/
  )
  if (minPriceMatch) {
    query.pricePerNight = { ...query.pricePerNight, $gte: Number(minPriceMatch[1]) }
  }

  const ratingMatch = msg.match(/(\d(?:\.\d)?)\s*(?:star|rating)/)
  if (ratingMatch) {
    query.averageRating = { $gte: Number(ratingMatch[1]) }
  }

  return query
}

// ── Parse location intent: include or exclude a state/city ────
const parseLocationFromMessage = (message) => {
  const msg = message.toLowerCase()

  const exclusionMatch = msg.match(
    /(?:outside|except|other than|not in|excluding)\s+([a-z][a-z\s]{1,30}?)(?:\s+under|\s+below|\s+above|\s+with|\s+having|\s+rated|\s+and\b|$)/
  )
  if (exclusionMatch) {
    return { location: exclusionMatch[1].trim(), exclude: true }
  }

  const inclusionMatch = msg.match(
    /(?:in|at|near|around|from|hotel[s]?\s+in)\s+([a-z][a-z\s]{1,30}?)(?:\s+under|\s+below|\s+above|\s+with|\s+having|\s+rated|\s+and\b|$)/
  )
  if (inclusionMatch) {
    return { location: inclusionMatch[1].trim(), exclude: false }
  }

  return null
}

// ── POST /api/chat ────────────────────────────────────────────
router.post(
  "/",
  optionalAuth,       // never blocks — attaches req.user if JWT valid, null if guest
  chatDailyLimiter,   // check daily quota first
  chatHourlyLimiter,  // then check hourly burst
  async (req, res) => {
    try {
      const { message, sessionId, filters = {} } = req.body

      // ── Risk 2: Type validation ─────────────────────────────
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" })
      }
      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ error: "sessionId is required" })
      }

      // ── TEMP: Remove after testing ──────────────────────────
      /* console.log("🔐 req.user:", req.user)
      console.log("🌐 req.ip:", req.ip)
      console.log("👤 User type:", req.user?.id ? `logged-in (${req.user.id})` : "guest") */

      // ── Risk 1: Sanitize message ────────────────────────────
      const cleanMessage = sanitizeMessage(message.trim())
      if (!cleanMessage) {
        return res.status(400).json({ error: "Invalid message content." })
      }

      if (!sessions.has(sessionId)) sessions.set(sessionId, [])
      const history = sessions.get(sessionId)

      // ── Parse filters from message ──────────────────────────
      const parsedFilters = parseMessageFilters(cleanMessage)
      const parsedLocation = parseLocationFromMessage(cleanMessage)

      // ── Build RAG filters to pass to Pinecone ───────────────
      const ragFilters = { ...filters }

      if (parsedLocation) {
        if (parsedLocation.exclude) ragFilters.excludeState = parsedLocation.location
        else ragFilters.includeState = parsedLocation.location
      }

      const maxPriceMatch = cleanMessage.match(
        /(?:under|below|less than|upto|up to)\s*[₹rs.]?\s*(\d+)/i
      )
      if (maxPriceMatch) ragFilters.maxPrice = Number(maxPriceMatch[1])

      const minRatingMatch = cleanMessage.match(/(\d(?:\.\d)?)\s*(?:star|rating)/i)
      if (minRatingMatch) ragFilters.minRating = Number(minRatingMatch[1])

      // ── RAG: retrieve hotels from Pinecone ───────────────────
      let context = ""
      let hotelIds = []

      try {
        const ragHotels = await retrieveHotels(cleanMessage, ragFilters)

        if (ragHotels.length > 0) {
          context = ragHotels
            .map((h) => h.pageContent || h.metadata?.text || "")
            .join("\n\n---\n\n")

          hotelIds = ragHotels.map((h) => h.id).filter(Boolean)
        }
      } catch (ragErr) {
        console.warn("⚠️ RAG retrieval failed:", ragErr.message)
      }

      // ── Build MongoDB location filter ────────────────────────
      let locationFilter = {}
      if (parsedLocation) {
        const locRegex = new RegExp(parsedLocation.location, "i")

        if (parsedLocation.exclude) {
          locationFilter = {
            state: { $not: locRegex },
            district: { $not: locRegex },
          }
        } else {
          locationFilter = {
            $or: [
              { state: locRegex },
              { district: locRegex },
              { name: locRegex },
            ],
          }
        }
      }

      // ── Fetch hotel cards from MongoDB ───────────────────────
      let hotels = []
      try {
        if (hotelIds.length > 0) {
          const objectIds = hotelIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id))

          if (objectIds.length > 0) {
            hotels = await Hotel.find({
              _id: { $in: objectIds },
              ...parsedFilters,
              ...locationFilter,
            })
              .sort({ averageRating: -1 })
              .limit(5)
          }
        }

        if (
          hotels.length === 0 &&
          (parsedLocation || Object.keys(parsedFilters).length > 0)
        ) {
          hotels = await Hotel.find({ ...parsedFilters, ...locationFilter })
            .sort({ averageRating: -1 })
            .limit(5)
        }
      } catch (dbErr) {
        console.warn("⚠️ MongoDB hotel fetch failed:", dbErr.message)
      }

      // ── Call Groq ────────────────────────────────────────────
      const userContent = context
        ? `Relevant hotels from our database:\n\n${context}\n\n---\n\nUser question: ${cleanMessage}`
        : cleanMessage

      const response = await client.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a helpful and friendly hotel assistant for SafarSetu.
You help users find the perfect hotel from our database of 136 hotels across India.
When hotel data is provided, use it to give specific accurate recommendations.
Always mention hotel name, price per night, and key amenities.
If user asks a follow-up question, use the previous conversation to answer correctly.
Be concise, warm, and helpful. Reply in the same language the user writes in.`,
          },
          ...history,
          { role: "user", content: userContent },
        ],
      })

      const reply = response.choices[0]?.message?.content
      if (!reply) throw new Error("Empty response from Groq")

      history.push({ role: "user", content: cleanMessage })
      history.push({ role: "assistant", content: reply })
      if (history.length > 20) history.splice(0, 2)

      return res.json({
        reply,
        sessionId,
        hotelsFound: hotels.length,
        hotels: hotels.map((h) => ({
          _id: h._id,
          name: h.name,
          district: h.district,
          state: h.state,
          pricePerNight: h.pricePerNight,
          averageRating: h.averageRating,
          totalReviews: h.totalReviews,
          type: h.type,
          amenities: h.amenities,
          images: h.images,
        })),
        rateLimit: {
          isGuest: !req.user,
          hourlyRemaining: req.rateLimit?.remaining ?? null,
          resetTime: req.rateLimit?.resetTime ?? null,
        },
      })
    } catch (err) {
      console.error("❌ Chat error:", err.message)
      return res.status(500).json({
        error: "Something went wrong. Please try again.",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
  }
)

// ── POST /api/chat/reset ──────────────────────────────────────
router.post("/reset", (req, res) => {
  const { sessionId } = req.body
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId)
  }
  return res.json({ ok: true })
})

module.exports = router