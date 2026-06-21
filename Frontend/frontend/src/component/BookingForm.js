import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../utils/auth";
import { createBooking } from "../services/bookingService";
import { checkAvailability } from "../services/notificationService";

const BookingForm = ({ hotel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // ✅ Read dates from URL if user came from home page search
 /*  const params = new URLSearchParams(location.search);
  const urlCheckIn = params.get("checkIn") || "";
  const urlCheckOut = params.get("checkOut") || ""; */
   const urlCheckIn = location.state?.checkIn || "";
   const urlCheckOut = location.state?.checkOut || "";

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    guests: 1,
    rooms: 1,
    specialRequests: "",
  });

  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [availability, setAvailability] = useState(null); // null | { bookedRooms, isAvailable }
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [availError, setAvailError] = useState("");

  // ✅ Calculate nights whenever dates change
  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const inDate = new Date(form.checkIn);
      const outDate = new Date(form.checkOut);
      const diff = Math.floor((outDate - inDate) / (1000 * 60 * 60 * 24));
      const validNights = diff > 0 ? diff : 0;
      setNights(validNights);
      setTotalPrice(validNights * Number(form.rooms) * Number(hotel?.pricePerNight || 0));
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [form.checkIn, form.checkOut, form.rooms, hotel?.pricePerNight]);

  // ✅ Check availability whenever dates or hotel changes
  useEffect(() => {
    const check = async () => {
      if (!form.checkIn || !form.checkOut || !hotel?._id) return;
      if (new Date(form.checkOut) <= new Date(form.checkIn)) return;

      setCheckingAvail(true);
      setAvailError("");
      setAvailability(null);

      try {
        const result = await checkAvailability({
          hotelId: hotel._id,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          rooms: form.rooms,
        });
        setAvailability(result);
      } catch (err) {
        setAvailError("Could not check availability. Try again.");
      } finally {
        setCheckingAvail(false);
      }
    };

    // Debounce: wait 600ms after user stops changing dates
    const timer = setTimeout(check, 600);
    return () => clearTimeout(timer);
  }, [form.checkIn, form.checkOut, hotel?._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAvailability(null); // reset availability on date change
  };

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (nights <= 0) {
      alert("Check-out must be after check-in");
      return;
    }

    // ✅ Defensive check — don't rely solely on the button being disabled.
    // Same principle as the refund-window fix: a disabled button is UX,
    // not enforcement. If this handler somehow fires while availability
    // is still unknown or unconfirmed (e.g. a fast double-click, or a
    // race in React's state batching), block here too rather than
    // submitting blind. The real authority is still the backend's
    // re-check in createBooking — this is just an additional layer.
    if (availability?.isAvailable !== true) {
      alert("Please wait for availability to be confirmed before booking.");
      return;
    }

    const bookingData = {
      ...form,
      hotelId: hotel._id,
      hotelName: hotel.name,
      totalPrice,
      nights,
    };

    try {
      const res = await createBooking(bookingData);
      /* const bookingId = res.data?._id || res._id; */
      const bookingId = res.data?._id || res._id || res.data?.id;

      // ✅ Handle the backend's 409 ROOMS_UNAVAILABLE response — the real
      // server-side re-check (see bookingController.js createBooking) can
      // still reject this even if the frontend thought it was fine, e.g.
      // if someone else booked the last room a moment earlier. Without
      // this check, the old code would just show the confusing
      // "Booking saved but ID missing ❌" message for what is actually
      // an expected, legitimate "someone beat you to it" scenario.
      if (res.code === "ROOMS_UNAVAILABLE" || res.error) {
        alert(res.error || "Sorry, those rooms were just booked by someone else. Please try different dates.");
        setAvailability(null); // force a fresh re-check before allowing another attempt
        return;
      }

      if (!bookingId) {
        alert("Booking saved but ID missing ❌");
        return;
      }

      alert("Booking Successful ✅");
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      console.error(err);
      alert("Booking Failed ❌");
    }
  };

  return (
    // ── Full-width container — removed the old `max-w-md mx-auto` cap that
    // was forcing this form into a narrow centered card regardless of how
    // wide its parent section was. Now it fills the space it's given. ────
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md w-full">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Guest Details:</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Name + Email — paired now that there's horizontal room to spare */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              className="w-full border p-2 sm:p-3 rounded mt-1 bg-gray-100 text-sm sm:text-base"
              readOnly
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              className="w-full border p-2 sm:p-3 rounded mt-1 bg-gray-100 text-sm sm:text-base"
              readOnly
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium">Phone *</label>
          <input
            type="text"
            name="phone"
            placeholder="Enter your phone number"
            className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base"
            onChange={handleChange}
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Check-in *</label>
            <input
              type="date"
              name="checkIn"
              value={form.checkIn}
              min={today}
              className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base"
              onChange={handleDateChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Check-out *</label>
            <input
              type="date"
              name="checkOut"
              value={form.checkOut}
              min={form.checkIn || today}
              className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base"
              onChange={handleDateChange}
              required
            />
          </div>
        </div>

        {/* ✅ Availability Status */}
        {(checkingAvail || availability || availError) && (
          <div className={`text-sm px-3 py-2 rounded-lg font-medium ${
            checkingAvail
              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
              : availError
              ? "bg-red-50 text-red-600 border border-red-200"
              : availability?.isAvailable
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {checkingAvail && "⏳ Checking availability..."}
            {!checkingAvail && availError && `⚠️ ${availError}`}
            {!checkingAvail && !availError && availability && (
              availability.isAvailable
                 ? `✅ ${availability.remainingRooms} room${availability.remainingRooms !== 1 ? "s" : ""} available for selected dates!`
        : `❌ Fully booked! All ${availability.totalRooms} rooms taken for these dates`
            )}
          </div>
        )}

        {/* Rooms + Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Rooms</label>
            <input
              type="number"
              name="rooms"
              min="1"
              value={form.rooms}
              className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base"
              onChange={(e) => {
                const rooms = Number(e.target.value);
                setForm((prev) => ({
                  ...prev,
                  rooms,
                  guests: prev.guests > rooms * 3 ? rooms * 3 : prev.guests,
                }));
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Guests (Max {form.rooms * 3})</label>
            <input
              type="number"
              name="guests"
              min="1"
              max={form.rooms * 3}
              value={form.guests}
              className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base"
              onChange={(e) => {
                let guests = Number(e.target.value);
                if (guests > form.rooms * 3) {
                  alert(`Max ${form.rooms * 3} guests allowed`);
                  guests = form.rooms * 3;
                }
                setForm({ ...form, guests });
              }}
            />
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="text-sm font-medium">Special Requests</label>
          <textarea
            name="specialRequests"
            placeholder="Any special requests..."
            className="w-full border p-2 sm:p-3 rounded mt-1 text-sm sm:text-base resize-none"
            rows="3"
            onChange={handleChange}
          />
        </div>

        {/* ✅ Dynamic Price Box */}
        <div className="bg-gray-100 p-4 rounded-lg text-sm sm:text-base">
          <div className="flex justify-between mb-1">
            <span>Price per night</span>
            <span>₹{hotel?.pricePerNight || 0}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Nights</span>
            <span className={nights === 0 ? "text-gray-400" : "text-green-600 font-semibold"}>
              {nights > 0 ? nights : "—"}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Rooms</span>
            <span>{form.rooms}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Guests</span>
            <span>{form.guests}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-base sm:text-lg">
            <span>Total</span>
            <span className="text-blue-600">
              {totalPrice > 0 ? `₹${totalPrice}` : "—"}
            </span>
          </div>
          {nights > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ₹{hotel?.pricePerNight} × {nights} night{nights > 1 ? "s" : ""} × {form.rooms} room{form.rooms > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Submit */}
        {(() => {
          // ✅ FIX — previously this only disabled when availability was
          // explicitly known to be false. The moment dates changed,
          // availability reset to null (see handleDateChange), and
          // `null?.isAvailable === false` evaluates to false — meaning
          // the button was clickable during the entire debounce + network
          // round-trip window, before the new check even came back.
          // A user could submit during that gap using stale/unknown
          // availability. Now the button also disables whenever
          // availability hasn't been confirmed yet (checking, unknown,
          // or errored), not only when we know for certain it's full.
          const availabilityConfirmedOk = availability?.isAvailable === true;
          const blocked =
            nights <= 0 ||
            checkingAvail ||
            !!availError ||
            !availabilityConfirmedOk;

          return (
            <button
              type="submit"
              disabled={blocked}
              className={`py-3 rounded-lg font-medium transition text-sm sm:text-base w-full ${
                blocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {checkingAvail ? "Checking availability..." : "Proceed to Payment"}
            </button>
          );
        })()}
      </form>
    </div>
  );
};

export default BookingForm;