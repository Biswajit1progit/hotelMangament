import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieBookingById, createMovieOrder, verifyMoviePayment, cancelReservation } from "../services/Movieservice";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

function MoviePaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const data = await getMovieBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Countdown to reservation expiry — keeps the user aware their seats
  // are only held temporarily, same spirit as flight/train booking UIs. ────
  useEffect(() => {
    if (!booking?.reservationExpiresAt || booking.status !== "pending_payment") return;

    const tick = () => {
      const diff = new Date(booking.reservationExpiresAt).getTime() - Date.now();
      setSecondsLeft(Math.max(Math.floor(diff / 1000), 0));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handlePayment = async () => {
    setPaying(true);
    try {
      const order = await createMovieOrder(bookingId);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Movie Tickets",
        order_id: order.id,

        handler: async function (response) {
          try {
            await verifyMoviePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            alert("Booking confirmed 🎬");
            navigate(`/movies/success/${bookingId}`, { replace: true });
          } catch (err) {
            console.error("Payment error:", err);
            alert(err.response?.data?.message || "Payment verification failed. Contact support if money was deducted.");
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert(err.response?.data?.error || "Could not start payment.");
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Release these seats?")) return;
    try {
      await cancelReservation(bookingId);
      navigate("/movies");
    } catch (err) {
      alert("Failed to cancel reservation");
    }
  };

  if (loading) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>
        <div className="min-h-screen pt-28 flex items-center justify-center text-gray-400">Loading…</div>
      </>
    );
  }

  if (!booking) return null;

  const expired = booking.status === "expired" || (secondsLeft !== null && secondsLeft <= 0 && booking.status === "pending_payment");

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50" />

      <div className="min-h-screen pt-28 pb-16 px-4 max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{booking.movieTitle}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {booking.theaterName} · {new Date(booking.showDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {booking.showTime}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500">Seats</span>
              <span className="font-medium">{booking.seats.join(", ")}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span className="text-rose-600">₹{booking.totalPrice}</span>
            </div>
          </div>

          {booking.status === "confirmed" ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-semibold text-gray-900">Already confirmed</p>
              <button onClick={() => navigate(`/movies/success/${bookingId}`)} className="mt-4 text-rose-600 text-sm font-medium">
                View ticket →
              </button>
            </div>
          ) : expired ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">⏰</p>
              <p className="font-semibold text-gray-900">Reservation expired</p>
              <p className="text-sm text-gray-500 mt-1">These seats were released. Please select again.</p>
              <button onClick={() => navigate("/movies")} className="mt-4 text-rose-600 text-sm font-medium">
                Browse movies →
              </button>
            </div>
          ) : (
            <>
              {secondsLeft !== null && (
                <p className={`text-center text-sm font-medium mb-4 ${secondsLeft < 60 ? "text-red-500" : "text-amber-600"}`}>
                  ⏳ Seats held for {formatTime(secondsLeft)}
                </p>
              )}

              <button
                onClick={handlePayment}
                disabled={paying}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  paying ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg"
                }`}
              >
                {paying ? "Processing…" : `Pay ₹${booking.totalPrice}`}
              </button>

              <button onClick={handleCancel} className="w-full py-2 mt-2 text-sm text-gray-400 hover:text-red-500 transition">
                Cancel & release seats
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MoviePaymentPage;