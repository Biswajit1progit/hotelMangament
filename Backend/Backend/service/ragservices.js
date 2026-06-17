/*  const { Pinecone } = require("@pinecone-database/pinecone")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

let pineconeIndex = null

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

  let enrichedQuery = query
  if (filters.maxPrice) enrichedQuery += ` under ₹${filters.maxPrice}`
  if (filters.amenities?.length)
    enrichedQuery += ` with ${filters.amenities.join(", ")}`
  if (filters.minRating)
    enrichedQuery += ` rated above ${filters.minRating} stars`

  const queryVector = await getEmbedding(enrichedQuery)

  
  const results = await index.query({
    vector: queryVector,
    topK: 10,
    includeMetadata: true,
  })

  const hotels = (results.matches || []).map((match) => ({
    pageContent: match.metadata?.text || "",
    metadata: match.metadata,
    score: match.score,
  }))

  return hotels
    .filter(({ metadata: m }) => {
      if (filters.maxPrice && Number(m.price) > Number(filters.maxPrice))
        return false
      if (filters.minRating && Number(m.rating) < Number(filters.minRating))
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

module.exports = { retrieveHotels, loadIndex } */
  
const { Pinecone } = require("@pinecone-database/pinecone")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

let pineconeIndex = null

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

  let enrichedQuery = query
  if (filters.maxPrice) enrichedQuery += ` under ₹${filters.maxPrice}`
  if (filters.amenities?.length)
    enrichedQuery += ` with ${filters.amenities.join(", ")}`
  if (filters.minRating)
    enrichedQuery += ` rated above ${filters.minRating} stars`

  const queryVector = await getEmbedding(enrichedQuery)

  const results = await index.query({
    vector: queryVector,
    topK: 10,
    includeMetadata: true,
  })

  const hotels = (results.matches || []).map((match) => ({
    id: match.id,                        // ✅ this is hotel._id.toString() from buildIndex.js
    pageContent: match.metadata?.text || "",
    metadata: match.metadata,
    score: match.score,
  }))

  return hotels
    .filter(({ metadata: m }) => {
      if (filters.maxPrice && Number(m.price) > Number(filters.maxPrice))
        return false
      if (filters.minRating && Number(m.rating) < Number(filters.minRating))
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