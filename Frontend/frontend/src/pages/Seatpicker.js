import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShowById, reserveSeats } from "../services/movieService";
import { getUser } from "../utils/auth";
import Hotelnav from "../component/filters/Hotelnav";
import Footer from "../component/footer";

const MAX_SEATS = 8; // reasonable per-booking cap, mirrors real ticketing UX

function SeatPicker() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState("");

  const [contact, setContact] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  useEffect(() => {
    fetchShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  const fetchShow = async () => {
    setLoading(true);
    try {
      const data = await getShowById(showId);
      setShow(data);
    } catch (err) {
      console.error("Failed to fetch show:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (seat.status !== "available") return;
    setError("");
    setSelected((prev) => {
      const exists = prev.includes(seat.seatNumber);
      if (exists) return prev.filter((s) => s !== seat.seatNumber);
      if (prev.length >= MAX_SEATS) {
        setError(`You can select up to ${MAX_SEATS} seats per booking`);
        return prev;
      }
      return [...prev, seat.seatNumber];
    });
  };

  // Group seats by row for grid rendering
  const rows = show?.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {}) || {};

  const totalPrice = show?.seats
    .filter((s) => selected.includes(s.seatNumber))
    .reduce((sum, s) => sum + s.price, 0) || 0;

  const handleReserve = async () => {
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    if (selected.length === 0) {
      setError("Select at least one seat");
      return;
    }
    if (!contact.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setReserving(true);
    setError("");
    try {
      const booking = await reserveSeats({
        showId,
        seatNumbers: selected,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });
      navigate(`/movies/payment/${booking._id}`);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to reserve seats. Please try again.";
      setError(message);
      // Seats may have been grabbed by someone else — refresh the map
      fetchShow();
      setSelected([]);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>
        <div className="min-h-screen pt-28 flex items-center justify-center text-gray-400">Loading seat map…</div>
      </>
    );
  }

  if (!show) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50"><Hotelnav /></div>

      <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
        {/* Show info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{show.movie?.title}</h1>
          <p className="text-sm text-gray-500">
            {show.theater?.name} · {new Date(show.showDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {show.showTime}
          </p>
        </div>

        {/* Screen indicator */}
        <div className="mb-8">
          <div className="h-2 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full mx-auto w-3/4 mb-1" />
          <p className="text-center text-xs text-gray-400 tracking-widest uppercase">Screen this way</p>
        </div>

        {/* Seat grid */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-max mx-auto flex flex-col gap-2">
            {Object.entries(rows).map(([rowLetter, seats]) => (
              <div key={rowLetter} className="flex items-center gap-2">
                <span className="w-5 text-xs font-semibold text-gray-400 text-center">{rowLetter}</span>
                <div className="flex gap-1.5">
                  {seats.sort((a, b) => a.col - b.col).map((seat) => {
                    const isSelected = selected.includes(seat.seatNumber);
                    const isBooked = seat.status === "booked";
                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked}
                        title={`${seat.seatNumber} · ₹${seat.price}${seat.seatType === "premium" ? " · Premium" : ""}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-[10px] font-semibold flex items-center justify-center transition ${
                          isBooked
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-rose-600 text-white scale-105"
                            : seat.seatType === "premium"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {seat.col}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" /> Standard</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> Premium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-600" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200" /> Booked</span>
          </div>
        </div>

        {/* Contact + summary */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-5 sm:p-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              type="text" placeholder="Full name" value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
            <input
              type="tel" placeholder="Phone number" value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500">Selected seats</span>
            <span className="font-medium">{selected.length > 0 ? selected.join(", ") : "None"}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Total</span>
            <span className="text-rose-600">₹{totalPrice}</span>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}

          <button
            onClick={handleReserve}
            disabled={reserving || selected.length === 0}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              reserving || selected.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:shadow-lg"
            }`}
          >
            {reserving ? "Reserving…" : "Continue to Payment"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default SeatPicker;