 import { useState } from "react";
import { createOrder, verifyPayment } from "../services/paymentService";
import PaymentInput from "./PaymentInput";
import { useNavigate } from "react-router-dom";


import PaymentMethods from "./PaymentMethod"
const PaymentForm = ({ booking }) => {
  const [method, setMethod] = useState("UPI");
  const [input, setInput] = useState("");
  
  const handlePayment = async () => {
    const order = await createOrder(booking.totalPrice);
   

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Hotel Booking",
      order_id: order.id,

     handler: async function (response) {
      /* const navigate = useNavigate(); */
  console.log("RAZORPAY RESPONSE:", response);

  try {
    const res = await verifyPayment({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      bookingId: booking._id,
      amount: booking.totalPrice,
      method: method.toLowerCase(),
    });

    console.log("VERIFY RESPONSE:", res);

    alert("Payment Success ✅");

    // ✅ SAFE NAVIGATION
   /*  setTimeout(() => {
      navigate(`/success/${booking._id}`);
    }, 500); */
    window.location.href = `/success/${booking._id}`;

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

      {/* Tabs */}
       {/* <div className="flex gap-3 mb-4 border-3 p-3 rounded border-blue-400 ">
        <svg viewBox="0 0 48 48" width="40" height="40">
  <rect x="4" y="10" width="40" height="28" rx="4" fill="#1976D2"/>
  <rect x="4" y="16" width="40" height="6" fill="#0D47A1"/>
  <rect x="8" y="26" width="12" height="4" fill="#ffffff"/>
        </svg>
        <button onClick={() => setMethod("card")} className="bg-blue-500 text-white p-2 rounded  ">
          Card
        </button>
        <svg viewBox="0 0 48 48" width="40" height="40">
  <circle cx="24" cy="24" r="22" fill="#E0E0E0"/>
  <text x="50%" y="55%" text-anchor="middle" font-size="14" fill="#333" font-family="Arial">
    UPI
  </text>
        </svg>
        <button onClick={() => setMethod("upi")} className="bg-blue-500 text-white p-2 rounded  ">
          UPI
        </button>
        <svg viewBox="0 0 48 48" width="40" height="40">
  <rect x="6" y="10" width="36" height="28" rx="4" fill="#4CAF50"/>
  <rect x="10" y="14" width="28" height="6" fill="#ffffff"/>
  <rect x="10" y="24" width="18" height="4" fill="#ffffff"/>
        </svg>
        <button onClick={() => setMethod("netbanking")} className="bg-blue-500 text-white p-2 rounded ">
          Net Banking
        </button>
      </div> */} 
       <PaymentMethods method={method} setMethod={setMethod} />

      {/* Dynamic Form */}
       {/* {method === "card" && (
        <div className="border-2 border-blue-600 py-2 rounded  bg-yellow-300">
          💳
          <span>Card No:</span>
          <input placeholder="Card Number" className="input boder-2 border-blue-600 bg-gray-600" />
          <span>Expiry:</span>
          <input placeholder="Expiry" className="input boder-2 border-blue-400" />
          <span>CVV:</span>
          <input placeholder="CVV" className="input boder-2 border-blue-400" />
        </div>
      )}  */}

    {/*  {method === "upi" && (
        <div className="border-2 border-blue-600 p-3 rounded  bg-yellow-300">
          <span>UPI ID:</span>
          <input placeholder="Enter UPI ID" className="" />
        </div>
      )} */} 

       {/* {method === "netbanking" && (
        <div className="border-2 border-blue-300 p-3 rounded ">
          <select className="input">
            <option>Select Bank</option>
            <option>SBI</option>
            <option>HDFC</option>
          </select>
        </div>
      )} */} 
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