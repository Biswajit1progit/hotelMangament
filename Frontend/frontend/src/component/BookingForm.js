import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../utils/auth";
import { createBooking } from "../services/bookingService";
import { checkAvailability } from "../services/notificationService";
import { validateOffer, getOffersForHotel } from "../services/Offerservice";

const BookingForm = ({ hotel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

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
  const [totalPrice, setTotalPrice] = useState(0); // pre-discount total
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [availError, setAvailError] = useState("");

  // ── Offer/coupon state ────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null); // { offerId, discount, finalAmount, applicableMethods, code }

  // ── Available offers for this hotel — fetched once we know the hotel ────
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!hotel?._id) return;
      setLoadingOffers(true);
      try {
        const offers = await getOffersForHotel(hotel._id);
        setAvailableOffers(offers.filter((o) => o.code)); // only code-based offers are user-selectable here
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, [hotel?._id]);

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

  // Any change to the amount invalidates a previously applied coupon —
  // re-validating against a stale bookingAmount could under/overcharge.
  useEffect(() => {
    if (appliedOffer) {
      setAppliedOffer(null);
      setCouponError("Room/date changed — please re-apply your coupon.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

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

    const timer = setTimeout(check, 600);
    return () => clearTimeout(timer);
  }, [form.checkIn, form.checkOut, hotel?._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAvailability(null);
  };

  const today = new Date().toISOString().split("T")[0];

  // ── Apply coupon ─────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!hotel?._id || totalPrice <= 0) {
      setCouponError("Select valid dates first");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const result = await validateOffer({
        code: couponCode.trim(),
        hotelId: hotel._id,
        bookingAmount: totalPrice,
        // paymentMethod intentionally omitted — not chosen yet at this stage.
        // Final enforcement happens server-side after payment (see paymentController).
      });

      setAppliedOffer({
        offerId: result.offerId,
        discount: result.discount,
        finalAmount: result.finalAmount,
        applicableMethods: result.applicableMethods || ["any"],
        code: couponCode.trim().toUpperCase(),
      });
    } catch (err) {
      setAppliedOffer(null);
      setCouponError(err.response?.data?.message || "Invalid or expired coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedOffer(null);
    setCouponCode("");
    setCouponError("");
  };

  // ── Select an offer card directly — applies it without the user having
  // to also type the code into the input box. ─────────────────────────
  const handleSelectOfferCard = async (offer) => {
    if (!hotel?._id || totalPrice <= 0) {
      setCouponError("Select valid dates first");
      return;
    }
    setCouponCode(offer.code);
    setApplyingCoupon(true);
    setCouponError("");

    try {
      const result = await validateOffer({
        code: offer.code,
        hotelId: hotel._id,
        bookingAmount: totalPrice,
      });

      setAppliedOffer({
        offerId: result.offerId,
        discount: result.discount,
        finalAmount: result.finalAmount,
        applicableMethods: result.applicableMethods || ["any"],
        code: offer.code.toUpperCase(),
      });
    } catch (err) {
      setAppliedOffer(null);
      setCouponError(err.response?.data?.message || "This offer could not be applied");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const payableAmount = appliedOffer ? appliedOffer.finalAmount : totalPrice;

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

    if (availability?.isAvailable !== true) {
      alert("Please wait for availability to be confirmed before booking.");
      return;
    }

    const bookingData = {
      ...form,
      hotelId: hotel._id,
      hotelName: hotel.name,
      totalPrice,                                       // pre-discount, matches original room price math
      nights,
      offerId: appliedOffer?.offerId || null,            // NEW
      discountApplied: appliedOffer?.discount || 0,      // NEW
    };

    try {
      const res = await createBooking(bookingData);
      const bookingId = res.data?._id || res._id || res.data?.id;

      if (res.code === "ROOMS_UNAVAILABLE" || res.error) {
        alert(res.error || "Sorry, those rooms were just booked by someone else. Please try different dates.");
        setAvailability(null);
        return;
      }

      if (!bookingId) {
        alert("Booking saved but ID missing ❌");
        return;
      }

      alert("Booking Successful ✅");
      // Pass along the offer's payment-method restriction + discounted
      // amount so the payment page can enforce/display it correctly.
      navigate(`/payment/${bookingId}`, {
        state: {
          payableAmount,
          discountApplied: appliedOffer?.discount || 0,
          applicableMethods: appliedOffer?.applicableMethods || ["any"],
        },
      });
    } catch (err) {
      console.error(err);
      alert("Booking Failed ❌");
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md w-full">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Guest Details:</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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

        {/* ── Available offers — discoverable cards ────────────────────── */}
        {!loadingOffers && availableOffers.length > 0 && !appliedOffer && (
          <div>
            <label className="text-sm font-medium mb-2 block">Available offers</label>
            <div className="flex flex-col gap-2">
              {availableOffers.map((o) => (
                <button
                  key={o._id}
                  type="button"
                  onClick={() => handleSelectOfferCard(o)}
                  disabled={applyingCoupon || totalPrice <= 0}
                  className={`text-left border rounded-lg px-3 py-2.5 transition ${
                    totalPrice <= 0
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        🎟️ {o.code} — {o.discountType === "flat" ? `₹${o.value} off` : `${o.value}% off${o.maxDiscountAmount ? ` (up to ₹${o.maxDiscountAmount})` : ""}`}
                      </p>
                      {o.title && <p className="text-xs text-gray-600 mt-0.5">{o.title}</p>}
                      {o.minBookingAmount > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">Min booking ₹{o.minBookingAmount}</p>
                      )}
                      {!o.applicableMethods?.includes("any") && (
                        <p className="text-xs text-amber-600 mt-0.5">Valid only for: {o.applicableMethods.join(", ")}</p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Tap to apply</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Coupon / Offer section ─────────────────────────────────── */}
        <div>
          <label className="text-sm font-medium">Have a coupon code?</label>
          {!appliedOffer ? (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 border p-2 sm:p-3 rounded text-sm sm:text-base uppercase tracking-wide"
                disabled={applyingCoupon || totalPrice <= 0}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applyingCoupon || !couponCode.trim() || totalPrice <= 0}
                className={`px-4 sm:px-5 rounded text-sm sm:text-base font-medium transition ${
                  applyingCoupon || !couponCode.trim() || totalPrice <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {applyingCoupon ? "..." : "Apply"}
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  🎟️ {appliedOffer.code} applied — you save ₹{appliedOffer.discount}
                </p>
                {!appliedOffer.applicableMethods.includes("any") && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Valid only for: {appliedOffer.applicableMethods.join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-medium text-red-500 hover:text-red-600 flex-shrink-0 ml-2"
              >
                Remove
              </button>
            </div>
          )}
          {couponError && (
            <p className="text-xs text-red-500 mt-1">⚠️ {couponError}</p>
          )}
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

          {appliedOffer && (
            <>
              <div className="flex justify-between mb-1 mt-2 pt-2 border-t border-gray-300">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between mb-1 text-green-600">
                <span>Coupon discount ({appliedOffer.code})</span>
                <span>−₹{appliedOffer.discount}</span>
              </div>
            </>
          )}

          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-base sm:text-lg">
            <span>Total</span>
            <span className="text-blue-600">
              {payableAmount > 0 ? `₹${payableAmount}` : "—"}
            </span>
          </div>
          {nights > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ₹{hotel?.pricePerNight} × {nights} night{nights > 1 ? "s" : ""} × {form.rooms} room{form.rooms > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {(() => {
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