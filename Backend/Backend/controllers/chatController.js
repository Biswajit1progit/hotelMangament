/* const { GoogleGenerativeAI } = require("@google/generative-ai");
const Hotel = require("../models/hotel"); */
const Hotel = require("../models/hotel");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// ✅ Single Gemini call — extracts filters AND generates reply
const extractFiltersAndReply = async (userMessage) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // free, fast, no quota issues
    messages: [
      {
        role: "system",
        content: `You are SafarSetu's hotel search assistant for India.
Extract search filters and return ONLY valid JSON (no markdown):
{
  "district": "city/district or null",
  "maxPrice": number or null,
  "minPrice": number or null,
  "rating": minimum rating or null,
  "amenities": [] or ["wifi","pool"],
  "type": "luxury/budget/resort or null",
  "intent": "search" or "greeting" or "help",
  "replyMessage": "one friendly sentence"
}`
      },
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const text = completion.choices[0].message.content.trim();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};
// ✅ Build MongoDB query from extracted filters
const buildHotelQuery = (filters) => {
  const query = {};

  if (filters.district) {
    query.district = { $regex: filters.district, $options: "i" };
  }
  if (filters.maxPrice) {
    query.pricePerNight = { ...query.pricePerNight, $lte: filters.maxPrice };
  }
  if (filters.minPrice) {
    query.pricePerNight = { ...query.pricePerNight, $gte: filters.minPrice };
  }
  if (filters.rating) {
    query.averageRating = { $gte: filters.rating };
  }
  if (filters.type) {
    query.type = { $regex: filters.type, $options: "i" };
  }
  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = { $in: filters.amenities.map(a => new RegExp(a, "i")) };
  }

  return query;
};

// ✅ Main chat endpoint
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Single Gemini call
    const filters = await extractFiltersAndReply(message);

    // Handle non-search intents
    if (filters.intent !== "search") {
      return res.json({
        reply: filters.replyMessage || "Hi! Ask me to find hotels anywhere in India! Try: 'Hotels in Goa under ₹2000'",
        hotels: [],
        intent: filters.intent,
      });
    }

    // Search hotels in MongoDB
    const query = buildHotelQuery(filters);
    const hotels = await Hotel.find(query)
      .sort({ averageRating: -1 })
      .limit(5);

    // Build reply without second Gemini call
    const reply = hotels.length === 0
      ? "No hotels found for your criteria. Try a different location or budget! 😊"
      : `${filters.replyMessage} Found ${hotels.length} hotel${hotels.length > 1 ? "s" : ""} for you! 🏨`;

    res.json({
      reply,
      hotels: hotels.map(h => ({
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
      intent: "search",
      filtersApplied: filters,
    });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { chat };