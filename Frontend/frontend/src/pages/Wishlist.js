import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "../services/authService";
import HotelCard from "../component/HotelCard";

const Wishlist = () => {
  const [hotels, setHotels] = useState([]);
  const [removing, setRemoving] = useState(null); // tracks which card is animating out

  useEffect(() => {
    const fetchWishlist = async () => {
      const data = await getWishlist(); // ✅ original fetch logic untouched
      setHotels(data);
    };
    fetchWishlist();
  }, []);

  // ✅ Remove a single hotel from wishlist — original logic untouched
  const handleRemove = async (hotelId) => {
    setRemoving(String(hotelId)); // trigger exit animation
    setTimeout(async () => {
      await toggleWishlist(hotelId); // toggles OFF (removes) since it's already wishlisted
      setHotels((prev) => prev.filter((h) => String(h._id) !== String(hotelId)));
      setRemoving(null);
    }, 300); // wait for animation before removing from DOM
  };

  // ✅ Clear all wishlisted hotels one by one — original logic untouched
  const handleClearAll = async () => {
    for (const hotel of hotels) {
      await toggleWishlist(hotel._id);
    }
    setHotels([]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 sm:p-8">

      {/* ── Ambient background blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] animate-pulse rounded-full bg-violet-600 opacity-20 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-80px] top-[40%] h-[300px] w-[300px] animate-pulse rounded-full bg-pink-500 opacity-15 blur-[80px]"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-80px] left-[30%] h-[260px] w-[260px] animate-pulse rounded-full bg-emerald-400 opacity-15 blur-[80px]"
        style={{ animationDelay: "3s" }}
      />

      {/* ── Glass header ── */}
      <div className="relative z-10 mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.07] px-6 py-5 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center">

        {/* Left: title + count */}
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span className="inline-block animate-bounce">❤️</span>
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {hotels.length} saved {hotels.length === 1 ? "property" : "properties"}
          </p>
        </div>

        {/* Right: logo + clear button */}
        <div className="flex items-center gap-4">
          {/* Mobile logo (icon only) */}
          <svg
            className="block sm:hidden"
            width="40"
            height="40"
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="SafarSetu"
          >
            <circle cx="25" cy="25" r="22" fill="#2563EB" />
            <path d="M8 33 C20 8, 37 8, 48 25" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <polygon points="32,14 46,20 32,24 36,30 28,24 16,26" fill="white" />
          </svg>

          {/* Desktop logo with text */}
          <svg
            className="hidden sm:block"
            width="160"
            height="50"
            viewBox="0 0 160 50"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="SafarSetu"
          >
            <g transform="translate(0,5)">
              <circle cx="25" cy="20" r="18" fill="#2563EB" />
              <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
            </g>
            <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="url(#logoGrad)">SafarSetu</text>
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>

          {/* ✅ Clear All Button — only shown when there are items (original condition) */}
          {hotels.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500/35 hover:text-white active:scale-95"
            >
              🗑️ Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state / Grid ── */}
      {hotels.length === 0 ? (
        /* ✅ Original empty check preserved */
        <div className="relative z-10 flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-4 text-6xl opacity-40">🏨</span>
          <p className="text-xl font-medium text-white/60">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-white/30">Save hotels you love and they'll appear here</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* ✅ Original .map() logic preserved exactly */}
          {hotels.map((hotel, i) => {
            return (
              <div
                key={hotel._id}
                style={{
                  animationDelay: `${i * 80}ms`,
                  opacity: removing === String(hotel._id) ? 0 : 1,
                  transform: removing === String(hotel._id) ? "scale(0.85)" : "scale(1)",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
                className="wishlist-card-glass animate-[fadeUp_0.4s_ease_both]"
              >
                <HotelCard key={hotel._id} hotel={hotel} onRemove={handleRemove} />
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Glass card wrapper ── */
        .wishlist-card-glass {
          position: relative;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        /* Hover: lift + violet glow border */
        .wishlist-card-glass:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow:
            0 0 0 1px rgba(139, 92, 246, 0.45),
            0 20px 50px rgba(0, 0, 0, 0.45),
            0 0 30px rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.50);
        }

        /* Shimmer shine sweep on hover */
        .wishlist-card-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255, 255, 255, 0.07) 50%,
            transparent 70%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          z-index: 1;
          pointer-events: none;
        }
        .wishlist-card-glass:hover::before {
          transform: translateX(100%);
        }

        /* Top edge glow line */
        .wishlist-card-glass::after {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.6), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }
        .wishlist-card-glass:hover::after {
          opacity: 1;
        }

        /* ── Override HotelCard's plain white interior ── */
        /* Make the card's own bg transparent so glass shows through */
        .wishlist-card-glass > * {
          background: transparent !important;
          border-radius: 20px !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* All text inside goes white / white-muted */
        .wishlist-card-glass h2,
        .wishlist-card-glass h3,
        .wishlist-card-glass p,
        .wishlist-card-glass span:not(.badge-exempt) {
          color: rgba(255, 255, 255, 0.90) !important;
        }

        /* Secondary / muted text (location, label rows) */
        .wishlist-card-glass .text-gray-500,
        .wishlist-card-glass .text-gray-400,
        .wishlist-card-glass .text-gray-600 {
          color: rgba(255, 255, 255, 0.45) !important;
        }

        /* Borders inside the card */
        .wishlist-card-glass .border,
        .wishlist-card-glass .border-gray-200,
        .wishlist-card-glass .border-gray-300 {
          border-color: rgba(255, 255, 255, 0.10) !important;
        }

        /* Price — accent violet */
        .wishlist-card-glass .text-blue-600,
        .wishlist-card-glass .text-blue-700,
        .wishlist-card-glass .text-indigo-600 {
          color: #a78bfa !important;
        }

        /* Rating badge — amber tint */
        .wishlist-card-glass .bg-yellow-100,
        .wishlist-card-glass .bg-amber-100 {
          background: rgba(251, 191, 36, 0.15) !important;
          border: 1px solid rgba(251, 191, 36, 0.30) !important;
          color: #fcd34d !important;
        }

        /* Remove / heart button inside card */
        .wishlist-card-glass button {
          position: relative;
          z-index: 2;
        }

        /* Wishlist / remove button — red glass style */
        .wishlist-card-glass button.text-red-500,
        .wishlist-card-glass button.text-red-600 {
          color: #fca5a5 !important;
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.30) !important;
          transition: background 0.2s ease, transform 0.2s ease !important;
        }
        .wishlist-card-glass button.text-red-500:hover,
        .wishlist-card-glass button.text-red-600:hover {
          background: rgba(239, 68, 68, 0.35) !important;
          color: #fff !important;
          transform: scale(1.08) !important;
        }

        /* View / Book button — violet gradient */
        .wishlist-card-glass button.bg-blue-600,
        .wishlist-card-glass a.bg-blue-600 {
          background: linear-gradient(90deg, rgba(139,92,246,0.55), rgba(59,130,246,0.55)) !important;
          border: 1px solid rgba(139, 92, 246, 0.40) !important;
          color: #e9d5ff !important;
          transition: filter 0.2s ease, transform 0.2s ease !important;
        }
        .wishlist-card-glass button.bg-blue-600:hover,
        .wishlist-card-glass a.bg-blue-600:hover {
          filter: brightness(1.2) !important;
          transform: translateY(-1px) !important;
          color: #fff !important;
        }

        /* Image stays full-width, just gets a gradient overlay */
        .wishlist-card-glass img {
          position: relative;
          z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;