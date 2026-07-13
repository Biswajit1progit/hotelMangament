import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieBookingById } from "../services/movieService";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

function MovieBookingSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    getMovieBookingById(bookingId).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50" />

      <div className="min-h-screen pt-28 pb-16 px-4 max-w-md mx-auto flex flex-col items-center text-center">
        <p className="text-6xl mb-4">🎟️</p>
        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-500 mt-1">Your tickets are ready</p>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6 mt-6 w-full text-left">
          <p className="font-bold text-lg text-gray-900">{booking.movieTitle}</p>
          <p className="text-sm text-gray-500 mb-4">
            {booking.theaterName} · {new Date(booking.showDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {booking.showTime}
          </p>
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Seats</span><span className="font-semibold">{booking.seats.join(", ")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{booking.name}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 mt-2">
              <span>Paid</span><span className="text-emerald-600">₹{booking.totalPrice}</span>
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/movies")} className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium">
          Browse more movies
        </button>
      </div>

      <Footer />
    </>
  );
}

export default MovieBookingSuccess;