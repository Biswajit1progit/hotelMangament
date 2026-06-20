import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PaymentForm from "../component/PaymentForm";
import BookingSummary from "../component/BookingSummary";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

// ── Shimmer Skeleton ──────────────────────────────────────────
const PaymentPageSkeleton = () => (
  <div className="flex flex-wrap gap-5 p-6 items-center justify-center mt-24">

    {/* Left – Payment Form skeleton */}
    <div className="p-5 border border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl w-[420px] animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
      {/* method pills */}
      <div className="flex gap-3 mb-5">
        <div className="h-10 bg-gray-200 rounded-full w-20" />
        <div className="h-10 bg-gray-200 rounded-full w-20" />
        <div className="h-10 bg-gray-200 rounded-full w-20" />
      </div>
      {/* input */}
      <div className="h-11 bg-gray-200 rounded w-full mb-4" />
      {/* pay button */}
      <div className="h-12 bg-gray-300 rounded w-full mt-4" />
    </div>

    {/* Right – Booking Summary skeleton */}
    <div className="p-5 border border-white/40 bg-white/60 backdrop-blur-xl rounded-2xl w-[320px] animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-36 mb-5" />
      <div className="h-4 bg-gray-200 rounded w-full mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
      <div className="h-px bg-gray-200 w-full mb-4" />
      <div className="h-6 bg-gray-300 rounded w-1/2" />
    </div>

  </div>
);

// ── Page ──────────────────────────────────────────────────────
const PaymentPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${id}`);
      const data = await res.json();
      setBooking(data);
    };
    fetchBooking();
  }, [id]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        <Hotelnav />
      </div>

      {/* ── Ambient backdrop — soft gradient + blurred color blobs, fixed
          behind everything in its own stacking context so it never
          interferes with the navbar's z-index. ───────────────────────── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50" />
      <div className="fixed top-10 left-10 w-80 h-80 -z-10 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="fixed bottom-10 right-10 w-80 h-80 -z-10 bg-emerald-200/30 rounded-full blur-3xl" />

      <div className="min-h-screen">
        {!booking ? (
          <PaymentPageSkeleton />
        ) : (
          <div className="flex flex-wrap gap-6 p-6 items-start justify-center mt-24">

            {/* ── Payment Form wrapper — glass card with mirror-sheen.
                PaymentForm's own internals are untouched; this only
                styles the container around it. ──────────────────────── */}
            <div
              className="
                relative w-[420px] max-w-full rounded-2xl
                bg-white/70 backdrop-blur-xl backdrop-saturate-150
                border border-white/60 shadow-xl shadow-blue-100/50
                p-1
                animate-[fadeInUp_0.5s_ease-out]
                transition-shadow duration-500 hover:shadow-2xl hover:shadow-blue-200/40
              "
            >
              {/* Mirror sheen */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-white/10 to-transparent"
                aria-hidden="true"
              />
              <div className="relative p-4">
                <PaymentForm booking={booking} />
              </div>
            </div>

            {/* ── Booking Summary — glass card, staggered entrance ────── */}
            <div
              className="
                relative w-[320px] max-w-full rounded-2xl
                bg-white/70 backdrop-blur-xl backdrop-saturate-150
                border border-white/60 shadow-xl shadow-emerald-100/50
                p-1
                animate-[fadeInUp_0.5s_ease-out_0.1s]
                transition-shadow duration-500 hover:shadow-2xl hover:shadow-emerald-200/40
              "
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-white/10 to-transparent"
                aria-hidden="true"
              />
              <div className="relative p-4">
                <BookingSummary booking={booking} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default PaymentPage;