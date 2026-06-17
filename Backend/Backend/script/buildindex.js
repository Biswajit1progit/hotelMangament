require("dotenv").config()
const mongoose = require("mongoose")
const { Pinecone } = require("@pinecone-database/pinecone")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const Hotel = require("../models/Hotel")

const INDEX_NAME = process.env.PINECONE_INDEX || "hotels"
const DIMENSION = 3072

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

async function buildIndex() {
  console.log("🔌 Connecting to MongoDB...")
  await mongoose.connect(process.env.MONGO_URI)
  console.log("✓ MongoDB connected")

  console.log("📦 Fetching hotels...")
  const hotels = await Hotel.find({})
  console.log(`✓ Found ${hotels.length} hotels`)

  if (hotels.length === 0) {
    console.error("❌ No hotels found.")
    process.exit(1)
  }

  // Test embedding first
  console.log("🧪 Testing Gemini embedding...")
  const test = await getEmbedding("test hotel")
  console.log(`✓ Embedding works — dimension: ${test.length}`)

  // Pinecone setup
  console.log("📌 Connecting to Pinecone...")
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

  const existing = await pinecone.listIndexes()
  const names = (existing.indexes || []).map((i) => i.name)

  if (names.includes(INDEX_NAME)) {
    console.log(`🗑️  Deleting old index...`)
    await pinecone.deleteIndex(INDEX_NAME)
    await new Promise((r) => setTimeout(r, 15000))
  }

  console.log(`📐 Creating Pinecone index (dimension: ${DIMENSION})...`)
  await pinecone.createIndex({
    name: INDEX_NAME,
    dimension: DIMENSION,
    metric: "cosine",
    spec: {
      serverless: { cloud: "aws", region: "us-east-1" },
    },
  })

  console.log("⏳ Waiting 40 seconds for index to be ready...")
  await new Promise((r) => setTimeout(r, 40000))
  console.log("✓ Index ready")

  const index = pinecone.index(INDEX_NAME)

  // ── Embed ALL hotels first, then upload ──────────────────────
  console.log(`⚡ Embedding ${hotels.length} hotels...`)
  const allVectors = []

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]

    const text = [
      `Hotel Name: ${h.name || "N/A"}`,
      `Location: ${h.location || h.city || h.address || "N/A"}`,
      `Price: ₹${h.price || h.pricePerNight || "N/A"} per night`,
      `Rating: ${h.rating || "N/A"} stars`,
      `Amenities: ${Array.isArray(h.amenities) ? h.amenities.join(", ") : h.amenities || "N/A"}`,
      `Description: ${h.description || "N/A"}`,
    ].join(" | ")

    const values = await getEmbedding(text)

    allVectors.push({
      id: h._id.toString(),
      values,
      metadata: {
  text,
  name: h.name || "",
  price: Number(h.price || h.pricePerNight || 0),
  rating: Number(h.rating || 0),
  amenities: Array.isArray(h.amenities) ? h.amenities.join(",") : "",
  location: typeof h.location === "object" ? (h.location?.city || h.location?.name || JSON.stringify(h.location)) : (h.location || h.city || h.address || "N/A")
},
    })

    console.log(`   Embedded ${i + 1}/${hotels.length}`)

    // Small delay to avoid rate limit
    await new Promise((r) => setTimeout(r, 200))
  }

  // ── Upload to Pinecone in batches of 50 ──────────────────────
  console.log(`☁️  Uploading ${allVectors.length} vectors to Pinecone...`)
  const BATCH_SIZE = 50

  for (let i = 0; i < allVectors.length; i += BATCH_SIZE) {
    const batch = allVectors.slice(i, i + BATCH_SIZE)
    if (batch.length > 0) {
     await index.upsert({ records: batch })
      console.log(`   Uploaded ${Math.min(i + BATCH_SIZE, allVectors.length)}/${allVectors.length}`)
    }
  }

  console.log("")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`✓ ${hotels.length} hotels uploaded to Pinecone`)
  console.log("🎉 Done! Run: npm run dev")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

  await mongoose.disconnect()
  process.exit(0)
}

buildIndex().catch((err) => {
  console.error("❌ Error:", err.message)
  console.error("Stack:", err.stack)
  process.exit(1)
})