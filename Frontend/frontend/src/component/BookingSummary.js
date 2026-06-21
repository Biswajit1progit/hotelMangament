const BookingSummary = ({ booking }) => {
  return (
    <div className="rounded-xl h-[550px] w-[300px] flex flex-col">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-slate-100">
        <span className="inline-block w-1.5 h-5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
        Booking Summary
      </h2>

      {/* ── Detail rows — Updated chips for robust dark mode contrast ── */}
      <div className="flex flex-col justify-center  gap-2.5 text-sm">
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-white/60 dark:border-slate-700/80 mr-3">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Name</span>
          <span className="text-gray-900 dark:text-slate-100 font-semibold truncate mr-2">{booking.name}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-white/60 dark:border-slate-700/80 mr-3">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Hotel</span>
          <span className="text-gray-900 dark:text-slate-100 font-semibold truncate mr-2">{booking.hotelName}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-white/60 dark:border-slate-700/80 mr-3">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Guests</span>
          <span className="text-gray-900 dark:text-slate-100 font-semibold">{booking.guests}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-white/60 dark:border-slate-700/80 mr-3">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Rooms</span>
          <span className="text-gray-900 dark:text-slate-100 font-semibold">{booking.rooms}</span>
        </div>
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-white/60 dark:border-slate-700/80 mr-3">
          <span className="text-gray-500 dark:text-slate-400 font-medium">Nights</span>
          <span className="text-gray-900 dark:text-slate-100 font-semibold">{booking.nights}</span>
        </div>
      </div>

      {/* Spacer pushes the total to the bottom */}
      <div className="flex-1" />

      <div className="border-t border-dashed border-gray-300 dark:border-slate-700 pt-4 mt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent px-2 mr-4">
            ₹{booking.totalPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;