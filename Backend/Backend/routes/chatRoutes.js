/*  const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController"); */

// POST /api/chat
/* router.post("/", chat);

module.exports = router;  */



const express = require("express")
const Groq = require("groq-sdk")
const { retrieveHotels } = require("../service/ragservices")
const Hotel = require("../models/hotel")

const router = express.Router()

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// ── In-memory session store ───────────────────────────────────
const sessions = new Map()

// ── POST /api/chat ────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { message, sessionId, filters = {} } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" })
    }
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    if (!sessions.has(sessionId)) sessions.set(sessionId, [])
    const history = sessions.get(sessionId)

    // ── RAG: retrieve relevant hotels from Pinecone ───────────
    let context = ""
    let hotelIds = []

    try {
      const ragHotels = await retrieveHotels(message.trim(), filters)

      if (ragHotels.length > 0) {
        context = ragHotels
          .map((h) => h.pageContent || h.metadata?.text || "")
          .join("\n\n---\n\n")

        // ✅ Each ragHotel now has { id, pageContent, metadata, score }
        // id = match.id from Pinecone = hotel._id.toString() set in buildIndex.js
        hotelIds = ragHotels.map((h) => h.id).filter(Boolean)
      }
    } catch (ragErr) {
      console.warn("⚠️ RAG retrieval failed:", ragErr.message)
    }

    // ── Fetch full hotel documents from MongoDB ───────────────
    let hotels = []
    try {
      if (hotelIds.length > 0) {
        hotels = await Hotel.find({ _id: { $in: hotelIds } })
          .sort({ averageRating: -1 })
          .limit(5)
      }

      // Fallback: keyword search if Pinecone IDs didn't resolve to any docs
      if (hotels.length === 0) {
        const words = message.trim().split(/\s+/).filter((w) => w.length > 3)
        if (words.length > 0) {
          const regexes = words.map((w) => new RegExp(w, "i"))
          hotels = await Hotel.find({
            $or: [
              { name: { $in: regexes } },
              { district: { $in: regexes } },
              { state: { $in: regexes } },
            ],
          })
            .sort({ averageRating: -1 })
            .limit(5)
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ MongoDB hotel fetch failed:", dbErr.message)
    }

    // ── Call Groq with context + history ─────────────────────
    const userContent = context
      ? `Relevant hotels from our database:\n\n${context}\n\n---\n\nUser question: ${message.trim()}`
      : message.trim()

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

    history.push({ role: "user", content: message.trim() })
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
    })
  } catch (err) {
    console.error("❌ Chat error:", err.message)
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
})

// ── POST /api/chat/reset ──────────────────────────────────────
router.post("/reset", (req, res) => {
  const { sessionId } = req.body
  if (sessionId && sessions.has(sessionId)) {
    sessions.delete(sessionId)
  }
  return res.json({ ok: true })
})

module.exports = router