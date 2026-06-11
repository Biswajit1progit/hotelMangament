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
    <div className="p-5 border rounded-lg w-[420px] animate-pulse">
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
    <div className="p-5 border rounded-lg w-[320px] animate-pulse">
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

      {!booking ? (
        <PaymentPageSkeleton />
      ) : (
        <div className="flex flex-wrap gap-5 p-6 items-center justify-center mt-24">
          <PaymentForm booking={booking} />
          <BookingSummary booking={booking} />
        </div>
      )}

      <Footer />
    </>
  );
};

export default PaymentPage;