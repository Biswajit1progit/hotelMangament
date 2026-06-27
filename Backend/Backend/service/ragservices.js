const { Pinecone } = require("@pinecone-database/pinecone")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

let pineconeIndex = null

// ── Capitalize each word: "goa" → "Goa", "west bengal" → "West Bengal" ──
const toTitleCase = (str) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase())

async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

async function loadIndex() {
  if (pineconeIndex) return pineconeIndex
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    pineconeIndex = pinecone.index(process.env.PINECONE_INDEX || "hotels")
    console.log("✓ Connected to Pinecone — hotel search ready")
  } catch (err) {
    console.error("❌ Could not connect to Pinecone:", err.message)
    throw err
  }
  return pineconeIndex
}

async function retrieveHotels(query, filters = {}) {
  const index = await loadIndex()

  // ── Normalize location to match Pinecone stored casing ───────
  const includeState = filters.includeState ? toTitleCase(filters.includeState) : null
  const excludeState = filters.excludeState ? toTitleCase(filters.excludeState) : null

  // ── Enrich query for better semantic search ───────────────────
  let enrichedQuery = query
  if (filters.maxPrice) enrichedQuery += ` under ₹${filters.maxPrice}`
  if (filters.amenities?.length) enrichedQuery += ` with ${filters.amenities.join(", ")}`
  if (filters.minRating) enrichedQuery += ` rated above ${filters.minRating} stars`
  if (includeState) enrichedQuery += ` in ${includeState}`
  if (excludeState) enrichedQuery += ` not in ${excludeState}, outside ${excludeState}`

  const queryVector = await getEmbedding(enrichedQuery)

  // ── Build Pinecone metadata filter ────────────────────────────
  const pineconeFilter = {}

  if (includeState) pineconeFilter.state = { $eq: includeState }
  if (excludeState) pineconeFilter.state = { $ne: excludeState }
  if (filters.maxPrice) pineconeFilter.price = { $lte: Number(filters.maxPrice) }
  if (filters.minRating) pineconeFilter.rating = { $gte: Number(filters.minRating) }

  const queryOptions = {
    vector: queryVector,
    topK: 10,
    includeMetadata: true,
  }

  // Only attach filter if non-empty — empty object breaks Pinecone query
  if (Object.keys(pineconeFilter).length > 0) {
    queryOptions.filter = pineconeFilter
  }

  const results = await index.query(queryOptions)

  const hotels = (results.matches || []).map((match) => ({
    id: match.id,
    pageContent: match.metadata?.text || "",
    metadata: match.metadata,
    score: match.score,
  }))

  // ── Post-filter as safety net (in case Pinecone filter misses) ─
  return hotels
    .filter(({ metadata: m }) => {
      if (filters.maxPrice && Number(m.price) > Number(filters.maxPrice))
        return false
      if (filters.minRating && Number(m.rating) < Number(filters.minRating))
        return false
      if (excludeState && m.state?.toLowerCase() === excludeState.toLowerCase())
        return false
      if (includeState && m.state?.toLowerCase() !== includeState.toLowerCase())
        return false
      if (filters.amenities?.length) {
        const has = (m.amenities || "")
          .split(",")
          .map((a) => a.trim().toLowerCase())
        if (!filters.amenities.every((a) => has.includes(a.toLowerCase())))
          return false
      }
      return true
    })
    .slice(0, 5)
}

module.exports = { retrieveHotels, loadIndex }