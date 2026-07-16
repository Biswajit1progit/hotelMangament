import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiClient";
import { getUser } from "../utils/auth";
import { getUserPayments, refundPayment } from "../services/paymentService";
import { getHotelById } from "../services/hotelservice";
import { getUserMovieBookings, downloadMovieInvoice } from "../services/Movieservice"; // NEW

const REFUND_WINDOW_MS = 2 * 60 * 60 * 1000;

const isRefundWindowOpen = (createdAt) => {
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() <= REFUND_WINDOW_MS;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const BookingThumbnail = ({ hotelId, hotelName }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hotelId) { setFailed(true); return; }
    let cancelled = false;
    getHotelById(hotelId)
      .then((hotel) => {
        if (cancelled) return;
        const url = hotel?.images?.[0];
        url ? setImgUrl(url) : setFailed(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [hotelId]);

  if (!failed && imgUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        <img src={imgUrl} alt={hotelName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailed(true)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-100 via-violet-100 to-blue-50 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-300">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01" />
      </svg>
    </div>
  );
};

// ── NEW: Movie booking card ─────────────────────────────────────────────
const MovieBookingCard = ({ b, index }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const blob = await downloadMovieInvoice(b._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SafarSetu-Movie-Invoice-${b._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const statusStyle = {
    confirmed: "bg-green-100 text-green-700",
    pending_payment: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-gray-100 text-gray-600",
    expired: "bg-red-100 text-red-600",
  }[b.status] || "bg-gray-100 text-gray-600";

  return (
    <div
      className="booking-card group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-lg shadow-rose-100/40 transition-all duration-500 hover:shadow-xl hover:shadow-rose-200/40 animate-[fadeInUp_0.5s_ease-out]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-4 sm:p-5">
        <p className="text-base font-semibold text-gray-900 mb-2">🎬 {b.movieTitle}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
            📍 {b.theaterName}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
            📅 {formatDate(b.showDate)} · {b.showTime}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
            🎟️ Seats: {b.seats.join(", ")}
          </span>
        </div>
        <div className="space-y-0.5 text-sm">
          <p className="text-gray-900"><b className="font-semibold">Amount:</b> ₹{b.totalPrice}</p>
          <p className="text-gray-600"><b className="font-semibold text-gray-900">Booked on:</b> {formatDateTime(b.createdAt)}</p>
          <p className="text-gray-600 break-all"><b className="font-semibold text-gray-900">Booking ID:</b> {b._id}</p>
        </div>
        <p className="mt-2">
          <b className="font-semibold text-gray-900 text-sm">Status:</b>{" "}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}>
            {b.status.replace(/_/g, " ")}
          </span>
        </p>
        {b.status === "confirmed" && (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="bg-gradient-to-r from-rose-600 to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            >
              {downloading ? "Downloading…" : "📄 Download Invoice"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser]               = useState(null);
  const [bookings, setBookings]       = useState([]);
  const userRef = useRef(null);

  // ── NEW: bookings tab toggle + movie bookings state ─────────────────────
  const [bookingTab, setBookingTab] = useState("hotels"); // "hotels" | "movies"
  const [movieBookings, setMovieBookings] = useState([]);
  const [movieBookingsLoaded, setMovieBookingsLoaded] = useState(false);

  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const sessionUser = getUser();
    if (!sessionUser) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
      return;
    }
    setAuthChecked(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = useCallback(() => {
    if (!userRef.current) return;
    getUserPayments()
      .then(setBookings)
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/profile" } });
        } else {
          console.error("Failed to fetch bookings:", err);
        }
      });
  }, [navigate]);

  // ── NEW: fetch movie bookings, lazily on first tab switch ───────────────
  const fetchMovieBookings = useCallback(() => {
    getUserMovieBookings()
      .then((data) => {
        setMovieBookings(data);
        setMovieBookingsLoaded(true);
      })
      .catch((err) => console.error("Failed to fetch movie bookings:", err));
  }, []);

  const handleTabChange = (tab) => {
    setBookingTab(tab);
    if (tab === "movies" && !movieBookingsLoaded) {
      fetchMovieBookings();
    }
  };

  useEffect(() => {
    if (!authChecked || !user) return;
    fetchBookings();
  }, [user, authChecked, fetchBookings]);

  useEffect(() => {
    if (!authChecked) return;
    const handleFocus      = () => fetchBookings();
    const handleVisibility = () => { if (document.visibilityState === "visible") fetchBookings(); };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authChecked, fetchBookings]);

  useEffect(() => {
    if (!authChecked) return;
    const params     = new URLSearchParams(window.location.search);
    const justBooked = params.has("booking");
    const t1 = setTimeout(() => fetchBookings(), 3000);
    const t2 = justBooked ? setTimeout(() => fetchBookings(), 6000) : null;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [authChecked, fetchBookings]);

  useEffect(() => {
    if (!authChecked) return;
    api.get("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/profile" } });
        }
      });
  }, [authChecked, navigate]);

  const handleCancelBooking = async (paymentId) => {
    const res = await refundPayment(paymentId);
    if (res.success) {
      alert("Refunded Successfully ✅");
      setBookings((prev) =>
        prev.map((item) => item._id === paymentId ? { ...item, status: "refunded" } : item)
      );
    } else {
      alert(res.message || "Refund failed ❌");
    }
  };

  if (!authChecked) return null;

  return (
    <div className="profile-page relative min-h-screen p-3 sm:p-6">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50" />
      <div className="fixed top-10 right-10 w-80 h-80 -z-10 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="fixed bottom-20 left-10 w-80 h-80 -z-10 bg-violet-200/30 rounded-full blur-3xl" />

      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {user && (
        <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-lg shadow-blue-100/50 animate-[fadeInUp_0.5s_ease-out]">
          <div className="rounded-full p-2.5 bg-gradient-to-br from-blue-100 to-violet-100 ring-1 ring-white/80 shadow-inner shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 font-semibold truncate">{user.name}</p>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
          </div>
          <div className="shrink-0">
            <svg className="block sm:hidden" width="36" height="36" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="22" fill="#2563EB" />
              <path d="M8 33 C20 8, 37 8, 48 25" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polygon points="32,14 46,20 32,24 36,30 28,24 16,26" fill="white" />
            </svg>
            <svg className="hidden sm:block" width="140" height="44" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">SafarSetu</text>
            </svg>
          </div>
        </div>
      )}

      {/* ── NEW: Bookings tab toggle ─────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-2">
        <button
          onClick={() => handleTabChange("hotels")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            bookingTab === "hotels"
              ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md"
              : "bg-white/70 text-gray-600 border border-gray-200 hover:bg-white"
          }`}
        >
          🏨 Hotel Bookings
        </button>
        <button
          onClick={() => handleTabChange("movies")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            bookingTab === "movies"
              ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md"
              : "bg-white/70 text-gray-600 border border-gray-200 hover:bg-white"
          }`}
        >
          🎬 Movie Bookings
        </button>
      </div>

      {/* ── Hotel Bookings (unchanged from before) ───────────────────────── */}
      {bookingTab === "hotels" && (
        bookings.length === 0 ? (
          <p className="mt-4 text-gray-500">No bookings found</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {bookings.map((b, i) => (
              <div key={b._id}
                className="booking-card group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-lg shadow-blue-100/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/40 animate-[fadeInUp_0.5s_ease-out]"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full h-36 sm:hidden p-3 pb-0">
                    <BookingThumbnail hotelId={b.hotelId} hotelName={b.hotelName} />
                  </div>
                  <div className="flex-1 p-4 sm:p-5">
                    <p className="text-base font-semibold text-gray-900 mb-2">{b.hotelName}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Booked: {formatDateTime(b.createdAt)}
                      </span>
                      {b.checkIn && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                          ↗ Check-in: {formatDate(b.checkIn)}
                        </span>
                      )}
                      {b.checkOut && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
                          ↙ Check-out: {formatDate(b.checkOut)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-sm">
                      <p className="text-gray-900"><b className="font-semibold">Amount:</b> ₹{b.amount}</p>
                      <p className="text-gray-600"><b className="font-semibold text-gray-900">Order No:</b> {b.orderNumber}</p>
                      <p className="text-gray-600 break-all"><b className="font-semibold text-gray-900">Booking ID:</b> {b.bookingId}</p>
                    </div>
                    <p className="mt-2">
                      <b className="font-semibold text-gray-900 text-sm">Status:</b>{" "}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === "success" ? "bg-green-100 text-green-700"
                        : b.status === "refunded" ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"}`}>
                        {b.status}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => window.open(`/success/${b.bookingId}`)}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.97]">
                        View Receipt
                      </button>
                      {(() => {
                        const refunded   = b.status === "refunded";
                        const windowOpen = isRefundWindowOpen(b.createdAt);
                        const disabled   = refunded || !windowOpen;
                        const label      = refunded ? "Refunded" : !windowOpen ? "Refund Window Expired" : "Cancel Booking";
                        return (
                          <button onClick={() => handleCancelBooking(b._id)} disabled={disabled}
                            title={!refunded && !windowOpen ? "Prepaid bookings are non-refundable after 2 hours." : undefined}
                            className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none">
                            {label}
                          </button>
                        );
                      })()}
                    </div>
                    {b.status !== "refunded" && !isRefundWindowOpen(b.createdAt) && (
                      <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                        <span>⏰</span> Refund window has passed. This prepaid booking is no longer refundable.
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:block w-44 p-3 pl-0">
                    <BookingThumbnail hotelId={b.hotelId} hotelName={b.hotelName} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── NEW: Movie Bookings ────────────────────────────────────────── */}
      {bookingTab === "movies" && (
        !movieBookingsLoaded ? (
          <p className="mt-4 text-gray-500">Loading…</p>
        ) : movieBookings.length === 0 ? (
          <p className="mt-4 text-gray-500">No movie bookings found</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {movieBookings.map((b, i) => (
              <MovieBookingCard key={b._id} b={b} index={i} />
            ))}
          </div>
        )
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;