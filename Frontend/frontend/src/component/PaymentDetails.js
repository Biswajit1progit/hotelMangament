 import PaymentCard from "./PaymentCard";

const PaymentDetails = ({ payments }) => {
  return (
    <div className="mt-4">
      {payments.map((p) => (
        <PaymentCard key={p._id} payment={p} />
      ))}
    </div>
  );
};

export default PaymentDetails;