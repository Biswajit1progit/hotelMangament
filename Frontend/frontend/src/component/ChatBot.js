import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { sendChatMessage } from "../services/chatService";
import { getAccessToken } from "../services/apiClient"; // ⚠️ ADJUST THIS PATH to wherever apiClient.js actually lives

// ✅ Mini hotel card shown inside chat
const ChatHotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const getImageSrc = (img) => {
    if (!img) return "/fallback.jpg";
    if (img.startsWith("http")) return img;
    return `${process.env.REACT_APP_API_URL}${img}`;
  };

  return (
    <div
      onClick={() => navigate(`/hotel/${hotel._id}`)}
      className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 mt-2"
    >
      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
        <img
          src={getImageSrc(hotel.images?.[0])}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm truncate">{hotel.name}</p>
        <p className="text-gray-500 text-xs">{hotel.district}, {hotel.state}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-blue-600 font-semibold text-xs">₹{hotel.pricePerNight}/night</span>
          <span className="text-yellow-500 text-xs">⭐ {hotel.averageRating?.toFixed(1) || "N/A"}</span>
        </div>
        {hotel.amenities?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {hotel.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Login nudge banner shown when guest hits rate limit
const LoginNudge = ({ message, onLoginClick }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-2">
    <p className="text-blue-700 text-xs font-medium">{message}</p>
    <button
      onClick={onLoginClick}
      className="mt-2 w-full text-xs bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold"
    >
      Login for more messages →
    </button>
  </div>
);

const SUGGESTIONS = [
  "Hotels in Goa under ₹2000",
  "Luxury resorts with pool",
  "Budget hotels in Mumbai",
  "Hotels with breakfast included",
  "Best rated hotels in Delhi",
];

const ChatBot = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I'm SafarSetu's AI assistant. Tell me where you want to stay and I'll find the perfect hotel for you!\n\nTry: *'Hotels in Goa under ₹2000 with pool'*",
      hotels: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [rateLimitInfo, setRateLimitInfo] = useState(null)

  const sessionId = useRef(crypto.randomUUID());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ✅ FIXED — was reading sessionStorage.getItem("token"), but the access
  // token is never stored there; it lives in-memory only, inside
  // apiClient.js. That meant isLoggedIn was always false and every chat
  // message was sent with no Authorization header — every logged-in user
  // was silently treated as a guest (5 msg/hr limit, guest-tier behavior).
  // getAccessToken() reads the real in-memory token.
  const getToken = () => getAccessToken() || null;

  // ✅ Re-checks every time chat opens — handles login/logout without remount
  const isLoggedIn = useMemo(() => !!getToken(), [open])

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    setShowSuggestions(false);
    setRateLimitInfo(null);

    setMessages((prev) => [...prev, { role: "user", text: userText, hotels: [] }]);
    setLoading(true);

    try {
      const token = getToken()

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          sessionId: sessionId.current,
        }),
      })

      if (res.status === 429) {
        const data = await res.json()

        setRateLimitInfo({
          isGuest: data.isGuest,
          message: data.message,
        })

        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: data.isGuest
              ? "⏳ You've reached your free message limit."
              : "⏳ " + data.message,
            hotels: [],
            isRateLimit: true,
          },
        ])
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error("Server error")
      }

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply,
          hotels: data.hotels || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again! 🙏",
          hotels: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current }),
      });
    } catch (err) {
      console.warn("Could not reset session:", err.message);
    }

    setMessages([
      {
        role: "bot",
        text: "👋 Chat cleared! What kind of hotel are you looking for?",
        hotels: [],
      },
    ]);
    setShowSuggestions(true);
    setRateLimitInfo(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }}
        title="Chat with AI"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {!open && (
          <span
            className="absolute w-full h-full rounded-full animate-ping opacity-30"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }}
          />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">SafarSetu AI</p>
                <p className="text-blue-100 text-xs">
                  {isLoggedIn ? "Hotel Search Assistant" : "Guest · 5 msg/hr free"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition"
              >
                Clear
              </button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : "w-full"}`}>
                  {msg.role === "bot" && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs shrink-0 mt-1">
                        🤖
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </div>
                        {msg.isRateLimit && rateLimitInfo?.isGuest && (
                          <LoginNudge
                            message={rateLimitInfo.message}
                            onLoginClick={() => {
                              setOpen(false)
                              navigate("/login")
                            }}
                          />
                        )}
                        {msg.hotels?.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.hotels.map((hotel) => (
                              <ChatHotelCard key={hotel._id} hotel={hotel} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div
                      className="px-4 py-3 rounded-2xl rounded-tr-none text-sm text-white leading-relaxed"
                      style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }}
                    >
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs shrink-0 mt-1">
                    🤖
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {showSuggestions && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 shrink-0">
              <p className="text-xs text-gray-400 mb-1.5">Try asking:</p>
              <div className="flex gap-1.5 flex-wrap">
                {SUGGESTIONS.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full hover:bg-blue-100 transition border border-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about hotels..."
                rows={1}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                style={{ maxHeight: "80px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)" }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-300 text-center mt-1.5">Powered by Groq AI</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;