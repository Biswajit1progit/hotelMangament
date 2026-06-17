


<div align="center">

<h1>🧭 SafarSetu</h1>

<h3>A Full-Stack Hotel Booking Platform</h3>

<p><strong>Search hotels &nbsp;·&nbsp; Book rooms &nbsp;·&nbsp; Pay securely &nbsp;·&nbsp; Get your invoice — all in one place.</strong></p>

<p>
  <a href="https://aonehotel.netlify.app"><img src="https://img.shields.io/badge/LIVE%20DEMO-aonehotel.netlify.app-blue?style=for-the-badge" alt="Live Demo"/></a>
  <a href="https://reactjs.org"><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js"/></a>
  <a href="https://www.mongodb.com/atlas"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"/></a>
  <a href="https://razorpay.com"><img src="https://img.shields.io/badge/Razorpay-Payments-0B2041?style=for-the-badge" alt="Razorpay"/></a>
  <a href="https://safer-setu.onrender.com"><img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge" alt="Render"/></a>
  <a href="https://aonehotel.netlify.app"><img src="https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge" alt="Netlify"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/></a>
</p>

<p>
  <strong>Government College of Engineering, Keonjhar</strong><br/>
  B.Tech — Computer Science &amp; Engineering &nbsp;|&nbsp; 3rd Year, 6th Semester &nbsp;|&nbsp; Academic Year 2025–26
</p>

<p>
  🔗 <a href="https://aonehotel.netlify.app">Live Demo</a> &nbsp;·&nbsp;
  📋 <a href="#-features">Features</a> &nbsp;·&nbsp;
  🏗️ <a href="#️-architecture-overview">Architecture</a> &nbsp;·&nbsp;
  🚀 <a href="#-getting-started">Setup Guide</a> &nbsp;·&nbsp;
  💡 <a href="#-key-engineering-decisions">Engineering Decisions</a>
</p>

</div>

---

## 📸 Screenshots

### 🏠 Homepage — Hero Search
> Search hotels by district and travel dates. Dark mode toggle available in the navbar.

![Homepage](./screenshots/homepage.png)

---

### 🏨 Hotel Listings — Search & Filter
> Filter hotels by price range, rating, and amenities (WiFi, Pool, Parking). Each card shows hotel type badge, star rating, and price per night.

![Hotel Listings](./screenshots/hotel-listings.png)

---

### 📋 Hotel Detail & Booking Form
> View hotel details with image gallery. Fill in guest details — name, email, phone, check-in/check-out dates, and room count — all in one page.

![Hotel Detail](./screenshots/hotel-detail.png)

---

### 💳 Payment Gateway — Razorpay
> Secure payment via Razorpay supporting UPI, Credit/Debit Card, Net Banking, Wallets, and Pay Later options.

**Step 1 — Select Payment Method**

![Payment Selection](./screenshots/payment-select.png)

**Step 2 — Razorpay Checkout**

![Razorpay Modal](./screenshots/razorpay-modal.png)

---

### 🧾 Booking Invoice (Auto-Generated PDF)
> After successful payment, users receive a branded GST invoice with order number, transaction ID, and itemized breakdown. Downloadable as PDF.

![Invoice](./screenshots/invoice.png)

---

### 👤 User Profile — My Bookings
> View all past and current bookings with booking ID, order number, amount, and status. Cancel bookings or view receipts directly.

![Profile Bookings](./screenshots/profile-bookings.png)

---

### ❤️ Wishlist
> Save hotels to wishlist for later. Remove individual hotels or clear all at once.

![Wishlist](./screenshots/wishlist.png)

---

## ✨ Features

### For Users
- 🔍 **Hotel Search** — Search by district and travel dates
- 🎛️ **Filters** — Price range, star rating, amenities (WiFi, Pool, Parking)
- 🤖 **AI Chatbot** — Conversational assistant powered by Gemini + Groq (Llama) to answer hotel queries, recommendations, and booking help
- 🧠 **Semantic Search (RAG)** — Context-aware search using Pinecone vector DB + Gemini embeddings; understands natural language queries like "budget hotel near beach with pool" instead of just keyword matching
- 🗺️ **Hotel Location Map** — Interactive map (Leaflet.js) showing exact hotel location so users can judge proximity to landmarks before booking
- 📋 **Hotel Detail Page** — Image gallery, location, pricing, guest booking form
- 💳 **Razorpay Payment** — UPI, Card, Net Banking, Wallets
- 🧾 **Auto Invoice** — GST-compliant PDF invoice generated post-payment
- ❤️ **Wishlist** — Save and manage favourite hotels
- 📦 **My Bookings** — View booking history, receipts, cancel bookings
- 🌙 **Dark Mode** — Full dark/light toggle across all pages
- 🔔 **Notification Bell** — Real-time booking notifications

### For Hotel Owners
- 🏨 **Owner Dashboard** — Manage hotels, view bookings and requests
- 📊 **Analytics** — Revenue charts, booking trends, KPI metrics (Recharts)
- ✅ **Booking Approvals** — Accept or reject booking requests
- ☁️ **Cloudinary Image Upload** — Hotel images stored in cloud

### For Admins
- 🛡️ **Admin Dashboard** — Manage users, hotels, and platform activity
- 🔐 **Role-Based Access** — Separate roles for user / hotelOwner / admin

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|------------|-------|
| React.js | Component-based UI |
| Tailwind CSS | Utility-first styling |
| Parcel | Module bundler |
| Recharts | Analytics charts |
| React Router | Client-side routing |

### Backend
| Technology | Usage |
|------------|-------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication & authorization |
| Bcrypt | Password hashing |

### Integrations & Services
| Service | Purpose |
|---------|---------|
| Razorpay | Payment gateway (UPI, Card, Net Banking, Wallets) |
| Cloudinary | Hotel image cloud storage |
| Brevo (SMTP) | Transactional emails via Nodemailer |
| Google OAuth | Social login authentication |
| Pinecone | Vector database for RAG semantic search |
| Gemini (Google AI) | Text embeddings for RAG pipeline |
| Groq (Llama) | LLM inference for AI chatbot responses |
| Leaflet.js | Interactive hotel location maps |
| MongoDB Atlas | Cloud database hosting |
| Render | Backend deployment |
| Netlify | Frontend deployment |

---

## 🏗️ Architecture Overview

```
User Browser (React + Tailwind)
        │
        ▼
    Netlify CDN
        │
        ▼
Express REST API (Render)
        │
   ┌────┴────────────────┐
   │                     │
MongoDB Atlas       External APIs
(travelDB)        ┌──────┴──────┐
                  │             │
              Razorpay     Cloudinary
                  │             │
              Brevo SMTP    Image CDN
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have accounts and API keys ready for all the services below before running the project locally.

| # | Service | What It's Used For | Get It Here |
|---|---------|-------------------|-------------|
| 1 | **Node.js v18+** | Runtime for backend | [nodejs.org](https://nodejs.org) |
| 2 | **MongoDB Atlas** | Cloud database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| 3 | **Razorpay** | Payment gateway (use test mode keys) | [razorpay.com](https://razorpay.com) |
| 4 | **Cloudinary** | Hotel image cloud storage | [cloudinary.com](https://cloudinary.com) |
| 5 | **Brevo** | SMTP transactional email | [brevo.com](https://www.brevo.com) |
| 6 | **Google Cloud Console** | OAuth 2.0 Client ID & Secret | [console.cloud.google.com](https://console.cloud.google.com) |
| 7 | **Gemini API** | Text embeddings for RAG pipeline | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| 8 | **Groq** | LLM inference (Llama) for AI chatbot | [console.groq.com](https://console.groq.com) |
| 9 | **Pinecone** | Vector DB for semantic search | [pinecone.io](https://www.pinecone.io) |

> 💡 **All services above have a free tier** — this entire project runs on free credits. No paid subscription needed to run it locally or deploy it.

### Clone & Install

```bash
# Clone repository
git clone https://github.com/Biswajit1progit/hotelMangament.git
cd hotelMangament

# Install frontend dependencies
cd Frontend/frontend
npm install

# Go back to root and install backend dependencies
cd ../../Backend/Backend
npm install
```

### Environment Variables

Create `.env` files in both `Backend/Backend/` and `Frontend/frontend/` directories using the `.env.example` templates provided in each folder.

**backend/.env**
```env
# Email
EMAIL_PASS=your_email_password

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-your-model-name

# Admin
ADMIN_SECRET_KEY=your_admin_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Vector DB
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# Email (Brevo SMTP)
BREVO_USER=your_brevo_smtp_login
BREVO_PASS=your_brevo_smtp_password
BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=your_sender_email

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URLs
FRONTEND_URL=http://localhost:1234
BACKEND_URL=http://localhost:5000

# Resend (alternative email)
RESEND_API_KEY=your_resend_api_key
```

**frontend/.env**
```env
REACT_APP_RAZORPAY_KEY=rzp_test_your_key
REACT_APP_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Run Locally

```bash
# Start backend (port 5000)
cd hotelMangament/Backend/Backend
npm run dev

# Start frontend (port 1234) — open a new terminal
cd hotelMangament/Frontend/frontend
npm start
```

---

## 📁 Project Structure

```
hotelMangament/
│
├── Backend/                              # Express REST API
│   ├── congfig/
│   │   ├── db.js                         # MongoDB connection
│   │   └── mail.js                       # Mail transporter config
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── hotelController.js
│   │   ├── notificationController.js
│   │   ├── ownerController.js
│   │   ├── paymentController.js
│   │   └── reviewController.js
│   │
│   ├── corn/
│   │   └── notificationcron.js           # Cron job for notifications
│   │
│   ├── invoices/                         # Generated invoice PDFs
│   │
│   ├── middleware/
│   │   └── authMiddleware.js             # JWT auth & role guard
│   │
│   ├── models/
│   │   ├── Booking.js
│   │   ├── hotel.js
│   │   ├── Notification.js
│   │   ├── OwnerRequest.js
│   │   ├── Payment.js
│   │   ├── Revie.js
│   │   └── User.js
│   │
│   ├── public/                           # Static assets
│   │
│   ├── routes/
│   │   ├── adminAnalyticsRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reviewRoutes.js
│   │
│   ├── script/
│   │   ├── buildindex.js                 # Pinecone index builder
│   │   ├── checkoutNotifier.js           # Checkout reminder script
│   │   ├── data.json                     # Seed data
│   │   ├── fixedbook.js
│   │   └── seedhotel.js                  # Hotel seeder
│   │
│   ├── service/
│   │   ├── emailService.js               # Brevo SMTP email logic
│   │   └── ragservices.js                # RAG pipeline (Gemini + Groq + Pinecone)
│   │
│   ├── utils/
│   │   ├── generateInvoicepdf.js         # GST invoice PDF generator
│   │   ├── generateOrderId.js            # Razorpay order ID generator
│   │   ├── genhlper.js                   # General helpers
│   │   └── verifySignature.js            # Razorpay webhook signature verifier
│   │
│   ├── .env                              # Environment variables (git-ignored)
│   ├── .env.example                      # Template for contributors
│   ├── package.json
│   └── serve.js                          # Entry point
│
└── frontend/                             # React + Parcel app
    ├── src/
    │   ├── component/
    │   │   ├── filters/                      # Filter UI components
    │   │   ├── search/                       # Search UI components
    │   │   ├── bell.js                       # Notification bell
    │   │   ├── BookingCard.js
    │   │   ├── BookingForm.js
    │   │   ├── BookingSummary.js
    │   │   ├── ChatBot.js                    # AI chatbot UI
    │   │   ├── collect.js
    │   │   ├── ContactForm.js
    │   │   ├── DarkModeToggle.js             # Dark/light mode toggle
    │   │   ├── footer.js
    │   │   ├── HotelCard.js
    │   │   ├── HotelMap.js
    │   │   ├── ImageGallery.js
    │   │   ├── Invoice.js                    # GST invoice renderer
    │   │   ├── Movecard.js
    │   │   ├── MyBooking.js
    │   │   ├── Navbar.js
    │   │   ├── PaymentCard.js
    │   │   ├── PaymentDetails.js
    │   │   ├── PaymentForm.js
    │   │   ├── PaymentInput.js
    │   │   ├── PaymentMethod.js
    │   │   ├── ProfileDrapdown.js            # Profile dropdown menu
    │   │   ├── ReviewForm.js
    │   │   ├── ReviewList.js
    │   │   ├── Searchbar.js
    │   │   └── Skeleton.js                   # Shimmer loading skeleton
    │   │
    │   ├── pages/
    │   │   ├── admin/                        # Admin dashboard pages
    │   │   ├── owner/
    │   │   │   ├── OwnerBookings.js
    │   │   │   ├── OwnerDashboard.js
    │   │   │   └── OwnerRequests.js
    │   │   ├── Booking.js
    │   │   ├── BookingDetails.js
    │   │   ├── ContactPage.js
    │   │   ├── Home.js
    │   │   ├── hotel.js                      # Hotel listing page
    │   │   ├── hoteldetail.js                # Hotel detail & booking form
    │   │   ├── Login.js
    │   │   ├── PaymentPage.js
    │   │   ├── Profile.js
    │   │   ├── Register.js
    │   │   ├── SuccessPage.js
    │   │   ├── UnderMaintenance.js
    │   │   └── Wishlist.js
    │   │
    │   ├── services/                         # API call functions
    │   │   ├── authService.js
    │   │   ├── bookingService.js
    │   │   ├── chatService.js
    │   │   ├── hotelservice.js
    │   │   ├── notificationService.js
    │   │   ├── paymentService.js
    │   │   ├── reviewserve.js
    │   │   └── uploadService.js
    │   │
    │   ├── styles/                           # Global CSS
    │   ├── utils/                            # Helper functions
    │   ├── App.js                            # Root component & routes
    │   ├── index.css
    │   └── index.js                          # Entry point
    │
    ├── public/                               # Static assets
    ├── dist/                                 # Production build output
    ├── .env                                  # Environment variables (git-ignored)
    ├── .env.example                          # Template for contributors
    ├── .postcssrc                            # PostCSS / Tailwind config
    ├── index.html
    ├── netlify.toml                          # Netlify deployment config
    ├── Vercel.json                           # Vercel deployment config
    ├── package-lock.json
    ├── package.json
    └── .gitignore
```

---

## 🔐 Authentication Flow

```
Register/Login → JWT Token (httpOnly cookie)
      │
      ▼
Protected Routes check JWT via middleware
      │
      ├── role: user       → User pages (booking, profile, wishlist)
      ├── role: hotelOwner → Owner dashboard, analytics
      └── role: admin      → Admin dashboard, full access
```

---

## 💡 Key Engineering Decisions

- **Brevo SMTP over Gmail** — Gmail SMTP fails on Render (IPv6/cloud IP block). Brevo works reliably in production.
- **Razorpay Webhook Signature Verification** — Payment status confirmed by verifying Razorpay's HMAC SHA256 signature on the backend (`verifySignature.js`), not trusting the frontend callback. Prevents payment tampering and fake success responses.
- **Cloudinary for Images** — Render's ephemeral filesystem means local uploads are wiped on restart; Cloudinary solves this permanently.
- **Class-based Dark Mode** — Added `dark-mode` class on `<html>` with a separate `dark.css` file instead of Tailwind's `darkMode: 'class'` config (Parcel compatibility).
- **Shimmer Loading States** — Skeleton screens on all data-heavy pages for a polished loading UX.
- **RAG Pipeline Architecture** — Hotel knowledge base chunked and embedded via Gemini, stored in Pinecone, retrieved at query time and passed as context to Groq (Llama) — keeping LLM responses grounded in real hotel data rather than hallucinated answers.

---
 
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


## 🔒 Security

| Concern | How It's Handled |
|---------|-----------------|
| **Authentication** | JWT tokens with expiry; protected routes via `authMiddleware.js` |
| **Role Authorization** | Role-based guard on every sensitive route — user / hotelOwner / admin |
| **Payment Integrity** | Razorpay HMAC SHA256 webhook signature verified server-side before confirming any booking |
| **CORS Policy** | Strict origin whitelist — only `aonehotel.netlify.app` and `localhost` allowed; `Authorization` header explicitly allowed |
| **Environment Secrets** | All API keys, secrets, and credentials stored in `.env` (git-ignored); `.env.example` provided for contributors |
| **Google OAuth** | OAuth 2.0 flow handled server-side; tokens never exposed to frontend directly |
| **Admin Access** | Admin routes protected by both JWT and a separate `ADMIN_SECRET_KEY` env variable |
| **Cross-Origin Cookies** | `SameSite` and `Secure` flags set on auth cookies for cross-origin (Netlify → Render) safety |

> ⚠️ **Known Issue** — Some CORS edge cases across environments (localhost → Render → Netlify) are still being actively debugged. Cross-origin preflight behavior differs between environments and is an ongoing fix.

---

## 🗺️ Roadmap

- [ ] Flight search integration (third-party API)
- [ ] Movie ticket booking flow
- [ ] Events listing page
- [ ] Review & rating system for hotels
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Biswajit Sahoo**
B.Tech Computer Science & Engineering · Government College of Engineering, Keonjhar · 6th Semester

[![GitHub](https://img.shields.io/badge/GitHub-Biswajit1progit-black?style=flat&logo=github)](https://github.com/Biswajit1progit)
[![Live Demo](https://img.shields.io/badge/Live-aonehotel.netlify.app-blue?style=flat)](https://aonehotel.netlify.app)

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <i>Built with ☕, debugging sessions, and a lot of Stack Overflow</i>
</div>

