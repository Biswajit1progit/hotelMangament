const BookingSummary = ({ booking }) => {
  return (
    <div className="rounded-xl h-[550px] w-[300px] flex flex-col">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
        <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
        Booking Summary
      </h2>

      {/* ── Detail rows — each a soft glass chip rather than plain text ── */}
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between items-center bg-white/50 rounded-lg px-3 py-2 border border-white/60">
          <span className="text-gray-500 font-medium">Name</span>
          <span className="text-gray-900 font-semibold truncate ml-2">{booking.name}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 rounded-lg px-3 py-2 border border-white/60">
          <span className="text-gray-500 font-medium">Hotel</span>
          <span className="text-gray-900 font-semibold truncate ml-2">{booking.hotelName}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 rounded-lg px-3 py-2 border border-white/60">
          <span className="text-gray-500 font-medium">Guests</span>
          <span className="text-gray-900 font-semibold">{booking.guests}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 rounded-lg px-3 py-2 border border-white/60">
          <span className="text-gray-500 font-medium">Rooms</span>
          <span className="text-gray-900 font-semibold">{booking.rooms}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 rounded-lg px-3 py-2 border border-white/60">
          <span className="text-gray-500 font-medium">Nights</span>
          <span className="text-gray-900 font-semibold">{booking.nights}</span>
        </div>
      </div>

      {/* Spacer pushes the total to the bottom, like a real receipt */}
      <div className="flex-1" />

      <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ₹{booking.totalPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;