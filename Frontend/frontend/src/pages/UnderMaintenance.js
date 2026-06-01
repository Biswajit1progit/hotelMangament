// ─────────────────────────────────────────────────────────────
// src/pages/UnderMaintenance.jsx
// Shown for Events, Movies, Flights — not yet live features
// ─────────────────────────────────────────────────────────────

import { useNavigate, useLocation } from "react-router-dom";

const PAGE_INFO = {
  "/movies":  { icon: "🎬", label: "Movies",  color: "#7c3aed", light: "#ede9fe" },
  "/flights": { icon: "✈️", label: "Flights", color: "#0284c7", light: "#e0f2fe" },
  "/events":  { icon: "🎉", label: "Events",  color: "#db2777", light: "#fce7f3" },
};

export default function UnderMaintenance() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const info      = PAGE_INFO[location.pathname] || { icon: "🔧", label: "This Page", color: "#2563eb", light: "#eff6ff" };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Animated icon bubble */}
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl sm:text-6xl"
          style={{
            backgroundColor: info.light,
            animation: "bounce 2s infinite",
          }}
        >
          {info.icon}
        </div>

        {/* Wrench spinning */}
        <div className="text-4xl mb-4" style={{ animation: "spin 3s linear infinite", display: "inline-block" }}>
          🔧
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {info.label} — Coming Soon!
        </h1>

        <p className="text-gray-500 text-sm sm:text-base mb-2">
          We're working hard to bring you the best {info.label.toLowerCase()} experience.
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mb-8">
          This feature is currently under maintenance. Stay tuned — it'll be worth the wait! 🚀
        </p>

        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden mx-auto max-w-xs">
          <div
            className="h-2 rounded-full"
            style={{
              backgroundColor: info.color,
              width: "65%",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-8">65% complete</p>

        {/* What's coming */}
        <div
          className="rounded-2xl p-4 mb-6 text-left"
          style={{ backgroundColor: info.light }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: info.color }}>
            What's coming:
          </p>
          <ul className="space-y-1.5">
            {getFeatures(info.label).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span style={{ color: info.color }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Notify badge */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <p className="text-xs text-gray-500 mb-3">Get notified when we launch</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
            />
            <button
              className="text-white px-4 py-2 rounded-xl text-xs font-medium transition hover:opacity-90"
              style={{ backgroundColor: info.color }}
            >
              Notify Me
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="bg-gray-800 text-white px-8 py-3 rounded-2xl text-sm font-medium hover:bg-gray-700 transition"
        >
          ← Back to Home
        </button>

        <p className="text-gray-300 text-xs mt-6">SafarSetu · All other features are fully live</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function getFeatures(label) {
  const map = {
    Movies:  ["Browse & book movie tickets", "Show timings & seat selection", "Reviews & ratings", "Offers & combo deals"],
    Flights: ["Search & compare flights", "Real-time price tracking", "Multi-city booking", "Baggage & meal add-ons"],
    Events:  ["Discover local events", "Concert & festival tickets", "Venue maps & seating", "Group bookings & offers"],
  };
  return map[label] || ["Coming soon", "Stay tuned"];
}