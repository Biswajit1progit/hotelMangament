 const BookingSummary = ({ booking }) => {
  return (
    <div className="border p-4 rounded-lg shadow h-[550px] w-[300px]">
      <h2 className="font-bold text-lg mb-3">Booking Summary</h2>

      <p><b>Name:</b> {booking.name}</p>
      <p><b>Hotel:</b> {booking.hotelName}</p>
      <p><b>Guests:</b> {booking.guests}</p>
      <p><b>Rooms:</b> {booking.rooms}</p>
      <p><b>Nights:</b> {booking.nights}</p>

      <hr className="my-2" />

      <h3 className="font-semibold text-lg">
        Total: ₹{booking.totalPrice}
      </h3>
    </div>
  );
};

export default BookingSummary;