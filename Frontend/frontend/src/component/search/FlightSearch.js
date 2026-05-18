 function FlightSearch() {
  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4
        w-full
      "
    >
      {/* From */}
      <div className="border p-3 rounded-lg w-full">
        <p className="text-xs text-gray-400 mb-1">From</p>
        <div className="flex justify-between items-center gap-2">
          <input
            placeholder="Delhi"
            className="
              outline-none
              font-semibold
              w-full
              min-w-0
              text-sm
              sm:text-base
            "
          />
          <span className="text-sm shrink-0">▼</span>
        </div>
      </div>

      {/* To */}
      <div className="border p-3 rounded-lg w-full">
        <p className="text-xs text-gray-400 mb-1">To</p>
        <div className="flex justify-between items-center gap-2">
          <input
            placeholder="Mumbai"
            className="
              outline-none
              font-semibold
              w-full
              min-w-0
              text-sm
              sm:text-base
            "
          />
          <span className="text-sm shrink-0">▼</span>
        </div>
      </div>

      {/* Departure */}
      <div className="border p-3 rounded-lg w-full">
        <p className="text-xs text-gray-400 mb-1">Departure</p>
        <input
          type="date"
          className="
            outline-none
            font-semibold
            w-full
            text-sm
            sm:text-base
          "
        />
      </div>

      {/* Search Button */}
      <button
        className="
          bg-blue-600
          text-white
          rounded-lg
          font-semibold
          p-3
          w-full
          hover:bg-blue-700
          transition
          text-sm
          sm:text-base
        "
      >
        Search
      </button>
    </div>
  );
}

export default FlightSearch;

      