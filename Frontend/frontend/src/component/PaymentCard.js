 const PaymentCard = ({ payment }) => {
  return (
    <div className="border p-4 rounded shadow mb-3 bg-green-50">
      <h3 className="font-bold text-lg">{payment.hotelName}</h3>
      <p>Transaction ID: {payment.razorpayPaymentId}</p>
      <p>Amount: ₹{payment.amount}</p>
      <p>Status: {payment.status}</p>
      <p>Method: {payment.paymentMethod}</p>
    </div>
  );
};

export default PaymentCard;