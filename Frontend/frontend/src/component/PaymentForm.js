 import { useState } from "react";
import { createOrder, verifyPayment } from "../services/paymentService";
import PaymentInput from "./PaymentInput";
import { useNavigate } from "react-router-dom";


import PaymentMethods from "./PaymentMethod"
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
}
    };

    const rzp = new window.Razorpay(options);
    
    rzp.open();
  };

  return (
    <div className="p-5 border rounded-lg">

      <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>

     
       <PaymentMethods method={method} setMethod={setMethod} />

      
       <PaymentInput method={method} input={input} setInput={setInput} /> 
      <button
        onClick={handlePayment}
        className="bg-green-600 text-white p-3 mt-4 w-full"
      >
        Pay ₹{booking.totalPrice}
      </button>

    </div>
  );
};

export default PaymentForm;