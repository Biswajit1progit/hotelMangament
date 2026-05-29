# hotelMangament




━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SafarSetu — RAG Chatbot Upgrade (Pinecone version)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ONLY 3 FILES CHANGE IN YOUR ENTIRE PROJECT:
────────────────────────────────────────────
  backend/scripts/buildIndex.js    ← NEW FILE
  backend/services/ragService.js   ← NEW FILE
  backend/routes/chatRoute.js      ← REPLACE existing

Frontend: ZERO changes.
Everything else in backend: ZERO changes.

═══════════════════════════════════════════════════
STEP 1 — GET PINECONE API KEY (3 minutes, free)
═══════════════════════════════════════════════════

1. Go to → https://app.pinecone.io
2. Click "Sign Up" — use Google or email (no credit card)
3. Select "Starter" plan → free
4. After login → click "API Keys" in left sidebar
5. Copy your API key — it looks like:
   pcsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

That's it — ONE key is all you need.
Pinecone creates the index automatically from your code.

═══════════════════════════════════════════════════
STEP 2 — ADD 4 LINES TO backend/.env
═══════════════════════════════════════════════════

Open your backend/.env and add at the bottom.
Do NOT change any existing lines:

  GROQ_MODEL=llama-3.3-70b-versatile
  HF_EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
  PINECONE_API_KEY=pcsk_your-key-here
  PINECONE_INDEX=hotels

═══════════════════════════════════════════════════
STEP 3 — COPY THE 3 FILES INTO YOUR PROJECT
═══════════════════════════════════════════════════

  buildIndex.js  →  backend/scripts/buildIndex.js   (new)
  ragService.js  →  backend/services/ragService.js  (new)
  chatRoute.js   →  backend/routes/chatRoute.js     (replace)

Make sure the folders exist:
  backend/scripts/    ← create if missing
  backend/services/   ← create if missing

═══════════════════════════════════════════════════
STEP 4 — INSTALL PACKAGES
═══════════════════════════════════════════════════

Open terminal → go to backend folder → run:

  npm install groq-sdk @pinecone-database/pinecone @langchain/community --legacy-peer-deps

No C++ tools needed. No Visual Studio needed.
Installs in under a minute.

═══════════════════════════════════════════════════
STEP 5 — RUN buildIndex.js (ONE TIME ONLY)
═══════════════════════════════════════════════════

  node scripts/buildIndex.js

Expected output:
  🔌 Connecting to MongoDB...
  ✓ MongoDB connected
  📦 Fetching hotels from DB...
  ✓ Found 133 hotels
  📌 Connecting to Pinecone...
  📐 Creating Pinecone index "hotels"...
  ⏳ Waiting for index to be ready (30 seconds)...
  ✓ Pinecone index ready
  🤖 Loading HuggingFace embedding model...
     First run downloads ~80MB — please wait...
  ✓ Embedding model loaded
  ⚡ Embedding and uploading 133 hotels...
     10/133 hotels processed
     20/133 hotels processed
     ...
     133/133 hotels processed
  ☁️  Uploading vectors to Pinecone...
     Uploaded batch 1
     Uploaded batch 2
  ✓ Successfully uploaded 133 hotels to Pinecone
  🎉 Done! Now start your server: npm run dev

IMPORTANT:
  • Run this only on your local machine
  • Never run on Render
  • Re-run only if you add/change hotels in MongoDB

═══════════════════════════════════════════════════
STEP 6 — START YOUR SERVER
═══════════════════════════════════════════════════

  npm run dev

You should see in terminal:
  ✓ Connected to Pinecone — hotel search ready

═══════════════════════════════════════════════════
STEP 7 — DEPLOY TO RENDER
═══════════════════════════════════════════════════

1. Push your 3 changed files to GitHub
2. Go to Render → your backend service → Environment tab
3. Add these 4 environment variables:

   Key                   Value
   ─────────────────────────────────────────────
   GROQ_MODEL            llama-3.3-70b-versatile
   HF_EMBEDDING_MODEL    Xenova/all-MiniLM-L6-v2
   PINECONE_API_KEY      pcsk_your-key-here
   PINECONE_INDEX        hotels

4. Click Save → Render redeploys automatically
5. Done — works in production with no localhost

═══════════════════════════════════════════════════
STEP 8 — TEST YOUR CHATBOT
═══════════════════════════════════════════════════

Open your chatbot and try these messages:

  "Show me hotels with a pool under ₹5000"
  "Which of those has free breakfast?"    ← tests memory
  "Show me the cheapest one"              ← tests follow-up
  "Hotels near Mumbai with gym"           ← tests semantic search

═══════════════════════════════════════════════════
COMMON ERRORS AND FIXES
═══════════════════════════════════════════════════

Error: Could not connect to Pinecone
→ Check PINECONE_API_KEY in .env (starts with pcsk_)
→ Make sure you ran buildIndex.js first

Error: 0 hotels found in DB
→ Open buildIndex.js line 14
→ Change "Hotel" to your actual model name

Error: ERESOLVE peer deps
→ Add --legacy-peer-deps to npm install command

Error: Groq 401 Unauthorized
→ Check GROQ_API_KEY in .env

Error: Index not found
→ Check PINECONE_INDEX=hotels in .env
→ Re-run: node scripts/buildIndex.js

Error: HuggingFace download fails
→ Check your internet connection
→ First download is ~80MB, wait for it