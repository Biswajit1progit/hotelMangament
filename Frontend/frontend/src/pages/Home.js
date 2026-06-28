import Navbar from "../component/Navbar";
import Searchbar from "../component/Searchbar";
import Movecard from "../component/Movecard";
import Footer from "../component/footer";
import ChatBot from "../component/ChatBot";

// ── Indian destination highlights ────────────────────────────
const DESTINATIONS = [
  { name: "Goa",       img: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&q=80", tag: "Beaches" },
  { name: "Jaipur",    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80", tag: "Heritage" },
  { name: "Kochi",    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80", tag: "Backwaters" },
  { name: "Manali",    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80", tag: "Mountains" },
  { name: "Varanasi",  img: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=80", tag: "Spiritual" },
  { name: "Coorg",     img: "https://images.unsplash.com/flagged/photo-1592544858330-7ac10a0468e5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", tag: "Nature" },
];

const WHY_US = [
  { icon: "🏨", title: "136+ Hotels",      desc: "Verified stays across India's finest districts" },
  { icon: "💳", title: "Secure Payments",  desc: "Razorpay-powered checkout with instant confirmation" },
  { icon: "🤖", title: "AI Concierge",     desc: "Smart chatbot finds your perfect stay in seconds" },
  { icon: "📍", title: "Live Map View",    desc: "See exact hotel location before you book" },
];

function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative min-h-screen bg-cover bg-center flex flex-col"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1471&auto=format&fit=crop")`,
        }}
      >
        {/* Dark gradient overlay — stronger at top for navbar, fades to mid */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60 z-0" />

        {/* Navbar */}
        <div className="w-full fixed top-0 left-0 z-50">
          <Navbar />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pt-[140px] sm:pt-[120px] lg:pt-24 pb-8 text-center">

          {/* Eyebrow */}
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-5 tracking-wide">
            🇮🇳 Discover India, One Stay at a Time
          </span>

          {/* Headline */}
          <h1 className="text-white font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
            Book Your Next<br />
            <span style={{
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Adventure
            </span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-md mb-8">
            From Himalayan retreats to coastal escapes — find and book verified hotels across India with AI-powered recommendations.
          </p>

          {/* Search bar card */}
         <div className="relative w-full max-w-5xl">
  {/* Glow Effect */}
  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/20 via-cyan-400/20 to-blue-600/20 blur-xl"></div>

  <div
    className="
      relative
      bg-black/25
      backdrop-blur-xl
      border border-white/10
      rounded-3xl
      overflow-hidden
      shadow-2xl
    "
  >
    {/* Tabs */}
    <div className="flex border-b border-white/10 px-4 pt-3 gap-2">
      {["Flights", "Hotels", "Movies", "Events"].map((tab) => (
        <button
          key={tab}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-300 ${
            tab === "Hotels"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Search Inputs */}
    <div className="p-5 bg-transparent">
      <Searchbar />
    </div>
  </div>
</div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/60 text-xs sm:text-sm">
            <span>✅ Free cancellation on select stays</span>
            <span className="hidden sm:inline">•</span>
            <span>🔒 100% secure payments</span>
            <span className="hidden sm:inline">•</span>
            <span>⭐ 136+ verified hotels</span>
          </div>
        </div>
      </div>

      {/* ── POPULAR DESTINATIONS ─────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
            Explore India
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Popular Destinations
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {DESTINATIONS.map((d) => (
              <a
                key={d.name}
                href={`/hotels?district=${d.name}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm">{d.name}</p>
                  <span className="text-white/70 text-xs">{d.tag}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SAFARSETU ────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
            Why SafarSetu
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Travel smarter, not harder
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-5 sm:p-6 hover:bg-blue-50 hover:shadow-md transition-all duration-200 group"
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base group-hover:text-blue-700 transition">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOVIE CARDS (existing component) ────────────────── */}
      <section className="px-4 sm:px-6 lg:px-12 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Movecard />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Bot */}
      <ChatBot />
    </>
  );
}

export default Home;