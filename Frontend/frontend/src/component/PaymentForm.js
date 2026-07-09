import { useState } from "react";
import { createOrder, verifyPayment } from "../services/paymentService";
import PaymentInput from "./PaymentInput";
import { useNavigate } from "react-router-dom";

import PaymentMethods from "./PaymentMethod";

const PaymentForm = ({ booking }) => {
  const [method, setMethod] = useState("UPI");
  const [input, setInput] = useState("");
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  // ── Offer/discount awareness ──────────────────────────────────────────
  // booking.discountApplied is set at createBooking time (see BookingForm.jsx).
  // The actual payable amount is the pre-discount totalPrice minus that.
  const discountApplied = booking.discountApplied || 0;
  const payableAmount = Math.max(booking.totalPrice - discountApplied, 0);
  const hasOffer = !!booking.offerId && discountApplied > 0;

  const handlePayment = async () => {
    setPaying(true);
    try {
      const order = await createOrder(payableAmount); // NEW: charge post-discount amount

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Hotel Booking",
        order_id: order.id,

        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
              amount: payableAmount, // NEW: matches what was actually charged
              method: method.toLowerCase(),
            });

            alert("Payment Success ✅");
            navigate(`/success/${booking._id}`, { replace: true });
          } catch (err) {
            console.error("Payment error:", err);
            // NEW: surface the real reason when it's an offer/method mismatch
            // rather than a generic message — e.g. "Offer 'CARD20' is not
            // valid for payment method 'upi'". Payment was captured by
            // Razorpay but rejected server-side, so this needs a manual
            // look (refund/support) rather than a silent retry.
            const message =
              err.response?.data?.message ||
              "Payment verification failed ❌. If money was deducted, contact support.";
            alert(message);
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => setPaying(false), // NEW: re-enable button if user closes checkout
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Could not start payment. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="p-1">
      <h2 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
        Select Payment Method
      </h2>

      <PaymentMethods method={method} setMethod={setMethod} />

      <PaymentInput method={method} input={input} setInput={setInput} />

      {/* NEW: discount summary, shown only if an offer was applied at booking */}
      {hasOffer && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Booking total</span>
            <span>₹{booking.totalPrice}</span>
          </div>
          <div className="flex justify-between text-green-600 font-medium mt-1">
            <span>Coupon discount</span>
            <span>−₹{discountApplied}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-bold mt-2 pt-2 border-t border-green-200">
            <span>Payable now</span>
            <span>₹{payableAmount}</span>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paying}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-emerald-600 to-teal-600 text-white
          p-3.5 mt-5 w-full rounded-xl font-semibold
          shadow-md transition-all duration-300
          ${paying
            ? "opacity-60 cursor-not-allowed"
            : "hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.01] active:scale-[0.98]"}
        `}
      >
        {paying ? "Processing…" : `Pay ₹${payableAmount}`}
      </button>
    </div>
  );
};

export default PaymentForm;