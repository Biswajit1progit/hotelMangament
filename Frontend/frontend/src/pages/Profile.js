import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { getUserBookings } from "../services/bookingService";
import { getUserPayments } from "../services/paymentService";
import { refundPayment } from "../services/paymentService";
import { getHotelById } from "../services/hotelservice";
import MyBookings from "../component/MyBooking";
import PaymentDetails from "../component/PaymentDetails";
import ImageGallery from "../component/ImageGallery";

// ── Small helper component: fetches and shows a hotel's image for a
// booking card. Falls back to a styled placeholder if the booking has
// no hotelId yet (i.e. backend hasn't been updated to include it), or
// if the fetch fails for any reason — never breaks the card layout. ──
const BookingThumbnail = ({ hotelId, hotelName }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hotelId) {
      setFailed(true);
      return;
    }
    let cancelled = false;

    getHotelById(hotelId)
      .then((hotel) => {
        if (cancelled) return;
        const url = hotel?.images?.[0];
        if (url) setImgUrl(url);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  if (!failed && imgUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        <img
          src={imgUrl}
          alt={hotelName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }

  // Placeholder — shown while loading and on any failure
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-100 via-violet-100 to-blue-50 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-300">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01"
        />
      </svg>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]); // ✅ ADD THIS
  /* Profile */

  const handleCancelBooking = async (paymentId) => {
    const res = await refundPayment(paymentId);

    if (res.success) {
      alert("Refunded Successfully ✅");

      setBookings((prev) =>
        prev.map((item) =>
          item._id === paymentId ? { ...item, status: "refunded" } : item
        )
      );
    }
  };
  /*  Fetch Bookings AFTER user loads */
  useEffect(() => {
    if (!user) return; // ✅ IMPORTANT

    fetch(`${process.env.REACT_APP_API_URL}/api/payment/user/${user.email}`)
      .then((res) => res.json())
      .then(setBookings);
  }, [user]); // ✅ DEPENDENCY FIX

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setUser(res.data);
    };

    fetchProfile();
  }, []);

  return (
    <div className="relative min-h-screen p-3 sm:p-6">

      {/* ── Ambient backdrop — soft gradient + blurred glow blobs, fixed
          behind everything, isolated stacking context. ───────────────── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50" />
      <div className="fixed top-10 right-10 w-80 h-80 -z-10 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="fixed bottom-20 left-10 w-80 h-80 -z-10 bg-violet-200/30 rounded-full blur-3xl" />

      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {user && (
        <div
          className="
            mt-4 relative flex items-center pr-12 sm:pr-4 p-4 rounded-2xl
            bg-white/70 backdrop-blur-xl backdrop-saturate-150
            border border-white/60 shadow-lg shadow-blue-100/50
            animate-[fadeInUp_0.5s_ease-out]
          "
        >
          <div className="rounded-full p-2.5 bg-gradient-to-br from-blue-100 to-violet-100 ring-1 ring-white/80 shadow-inner shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
              />
            </svg>
          </div>

          <div className="ml-3">
            <p className="text-gray-900">
              <strong className="font-semibold">Name:</strong> {user.name}
            </p>
            <p className="text-gray-700">
              <strong className="font-semibold">Email:</strong> {user.email}
            </p>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {/* Mobile — circle icon only */}
            <svg className="block sm:hidden" width="40" height="40" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="22" fill="#2563EB" />
              <path d="M8 33 C20 8, 37 8, 48 25" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polygon points="32,14 46,20 32,24 36,30 28,24 16,26" fill="white" />
            </svg>

            {/* Desktop — full logo with text */}
            <svg className="hidden sm:block" width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">
                SafarSetu
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* 🔥 BOOKING HISTORY */}
      <h2 className="text-xl mt-8 font-semibold text-gray-900 flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
        My Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="mt-3 text-gray-500">No bookings found</p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {bookings.map((b, i) => (
            <div
              key={b._id}
              className="
                group relative rounded-2xl overflow-hidden
                bg-white/70 backdrop-blur-xl backdrop-saturate-150
                border border-white/60 shadow-lg shadow-blue-100/40
                transition-all duration-500
                hover:shadow-xl hover:shadow-blue-200/40
                animate-[fadeInUp_0.5s_ease-out]
              "
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row">

                {/* ── Details — left ──────────────────────────────── */}
                <div className="flex-1 p-4 sm:p-5">
                  <p className="text-gray-900">
                    <b className="font-semibold">Hotel:</b> {b.hotelName}
                  </p>
                  <p className="text-gray-900">
                    <b className="font-semibold">Amount:</b> ₹{b.amount}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <b className="font-semibold text-gray-900">Order No:</b> {b.orderNumber}
                  </p>
                  <p className="text-gray-600 text-sm break-all">
                    <b className="font-semibold text-gray-900">Booking ID:</b> {b.bookingId}
                  </p>
                  <p className="mt-1">
                    <b className="font-semibold text-gray-900">Status:</b>{" "}
                    <span
                      className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                        ${b.status === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : b.status === "refunded"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-50 text-amber-700"}
                      `}
                    >
                      {b.status}
                    </span>
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => window.open(`/success/${b.bookingId}`)}
                      className="
                        bg-gradient-to-r from-blue-600 to-violet-600 text-white
                        px-3 py-1.5 rounded-lg text-sm font-medium
                        shadow-sm transition-all duration-300
                        hover:shadow-md hover:scale-[1.03] active:scale-[0.97]
                      "
                    >
                      View Receipt
                    </button>

                    <button
                      onClick={() => {
                        handleCancelBooking(b._id);
                      }}
                      disabled={b.status === "refunded"}
                      className="
                        bg-gradient-to-r from-red-500 to-rose-600 text-white
                        px-3 py-1.5 rounded-lg text-sm font-medium
                        shadow-sm transition-all duration-300
                        hover:shadow-md hover:scale-[1.03] active:scale-[0.97]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
                      "
                    >
                      {b.status === "refunded" ? "Refunded" : "Cancel Booking"}
                    </button>
                  </div>
                </div>

                {/* ── Hotel image — right. Falls back to a styled
                    placeholder if b.hotelId isn't present in the booking
                    payload yet (depends on backend response shape). ──── */}
                <div className="w-full sm:w-44 h-36 sm:h-auto p-3 sm:p-3 sm:pl-0">
                  <BookingThumbnail hotelId={b.hotelId} hotelName={b.hotelName} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;