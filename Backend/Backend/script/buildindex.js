require("dotenv").config()
const mongoose = require("mongoose")
const { Pinecone } = require("@pinecone-database/pinecone")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const Hotel = require("../models/hotel")

const INDEX_NAME = process.env.PINECONE_INDEX || "hotels"
const DIMENSION = 3072

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

// ✅ Retry with exponential backoff — handles 503 Gemini outages
async function getEmbedding(text, retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await embeddingModel.embedContent(text)
      return result.embedding.values
    } catch (err) {
      const is503 = err.message?.includes("503") || err.message?.includes("unavailable")
      const isLast = attempt === retries

      if (isLast) throw err

      if (is503) {
        console.warn(`   ⚠️  Gemini 503 on attempt ${attempt}/${retries} — retrying in ${delayMs / 1000}s...`)
        await new Promise((r) => setTimeout(r, delayMs))
        delayMs *= 2 // exponential backoff: 3s → 6s → 12s → 24s
      } else {
        throw err // non-503 errors fail immediately
      }
    }
  }
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

  console.log("🧪 Testing Gemini embedding...")
  const test = await getEmbedding("test hotel")
  console.log(`✓ Embedding works — dimension: ${test.length}`)

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

  console.log(`⚡ Embedding ${hotels.length} hotels...`)
  const allVectors = []
  let failed = []

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]

    const text = [
      `Hotel Name: ${h.name || "N/A"}`,
      `District: ${h.district || "N/A"}`,
      `State: ${h.state || "N/A"}`,
      `Location: ${h.district || ""}, ${h.state || ""}`,
      `Address: ${h.address || "N/A"}`,
      `Price: ₹${h.pricePerNight || h.price || "N/A"} per night`,
      `Rating: ${h.averageRating || h.rating || "N/A"} stars`,
      `Type: ${h.type || "N/A"}`,
      `Rooms: ${h.rooms || "N/A"}`,
      `Amenities: ${Array.isArray(h.amenities) ? h.amenities.join(", ") : h.amenities || "N/A"}`,
      `Description: ${h.description || "N/A"}`,
    ].join(" | ")

    try {
      const values = await getEmbedding(text)

      allVectors.push({
        id: h._id.toString(),
        values,
        metadata: {
          text,
          name: h.name || "",
          district: h.district || "",
          state: h.state || "",
          price: Number(h.pricePerNight || h.price || 0),
          rating: Number(h.averageRating || h.rating || 0),
          type: h.type || "",
          amenities: Array.isArray(h.amenities) ? h.amenities.join(",") : (h.amenities || ""),
          location: h.district && h.state
            ? `${h.district}, ${h.state}`
            : typeof h.location === "object"
              ? JSON.stringify(h.location)
              : (h.location || h.city || h.address || "N/A"),
        },
      })

      console.log(`   ✓ ${i + 1}/${hotels.length}: ${h.name} — ${h.district}, ${h.state}`)
    } catch (err) {
      console.error(`   ❌ Failed: ${h.name} — ${err.message}`)
      failed.push({ id: h._id.toString(), name: h.name })
    }

    // Small delay to avoid rate limit
    await new Promise((r) => setTimeout(r, 300))
  }

  // ── Upload to Pinecone in batches of 50 ──────────────────────
  console.log(`\n☁️  Uploading ${allVectors.length} vectors to Pinecone...`)
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
  console.log(`✓ ${allVectors.length} hotels uploaded to Pinecone`)
  if (failed.length > 0) {
    console.log(`⚠️  ${failed.length} hotels failed to embed:`)
    failed.forEach((f) => console.log(`   - ${f.name} (${f.id})`))
    console.log("   Re-run the script to retry failed hotels")
  }
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