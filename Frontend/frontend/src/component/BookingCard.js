 const BookingCard = ({ booking }) => {
  return (
    <div className="border p-4 rounded shadow mb-3">
      <h3 className="font-bold text-lg">{booking.hotelName}</h3>
      <p>Guests: {booking.guests}</p>
      <p>Rooms: {booking.rooms}</p>
      <p>Nights: {booking.nights}</p>
      <p>Total: ₹{booking.totalPrice}</p>
    </div>
  );
};

export default BookingCard;