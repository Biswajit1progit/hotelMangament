 import BookingCard from "./BookingCard";

const MyBookings = ({ bookings }) => {
  return (
    <div className="mt-4">
      {bookings.map((b) => (
        <BookingCard key={b._id} booking={b} />
      ))}
    </div>
  );
};

export default MyBookings;