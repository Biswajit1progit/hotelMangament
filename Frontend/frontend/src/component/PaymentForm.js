import { useState } from "react";
import { createOrder, verifyPayment } from "../services/paymentService";
import PaymentInput from "./PaymentInput";
import { useNavigate } from "react-router-dom";

import PaymentMethods from "./PaymentMethod";

const PaymentForm = ({ booking }) => {
  const [method, setMethod] = useState("UPI");
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handlePayment = async () => {
    const order = await createOrder(booking.totalPrice);

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Hotel Booking",
      order_id: order.id,

      handler: async function (response) {
        try {
          const res = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: booking._id,
            amount: booking.totalPrice,
            method: method.toLowerCase(),
          });

          alert("Payment Success ✅");

          /*  window.location.href = `/success/${booking._id}`; */
          navigate(`/success/${booking._id}`, { replace: true });
        } catch (err) {
          console.error("Payment error:", err);
          alert("Payment verification failed ❌");
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.open();
  };

  return (
    // ── Wrapper only — visual styling lives here. PaymentMethods and
    // PaymentInput render their own internals untouched, so any glass/glow
    // treatment for the individual method cards or input field needs to be
    // applied inside those components directly. ─────────────────────────
    <div className="p-1">
      <h2 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
        Select Payment Method
      </h2>

      <PaymentMethods method={method} setMethod={setMethod} />

      <PaymentInput method={method} input={input} setInput={setInput} />

      <button
        onClick={handlePayment}
        className="
          relative overflow-hidden
          bg-gradient-to-r from-emerald-600 to-teal-600 text-white
          p-3.5 mt-5 w-full rounded-xl font-semibold
          shadow-md transition-all duration-300
          hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.01]
          active:scale-[0.98]
        "
      >
        Pay ₹{booking.totalPrice}
      </button>
    </div>
  );
};

export default PaymentForm;