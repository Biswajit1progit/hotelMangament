 function FilterSidebar({ filters, setFilters, applyFilters }) {
  return (
  <div
    className="
      w-full
      md:w-64
      p-4
      border
      rounded-lg
      bg-white
      shadow-md
      max-h-[80vh]
      overflow-y-auto
    "
  >
    {/* Heading */}
    <h2 className="font-bold mb-4 text-lg text-center md:text-left">
      Filters
    </h2>

    {/* Min Price */}
    <div className="mb-4">
      <p className="mb-1 text-sm sm:text-base font-medium">Min Price</p>
      <input
        type="number"
        placeholder="Enter minimum price"
        onChange={(e) =>
          setFilters({ ...filters, minPrice: e.target.value })
        }
        className="
          border
          w-full
          p-2
          rounded
          bg-orange-50
          text-sm
          sm:text-base
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
        "
      />
    </div>

    {/* Max Price */}
    <div className="mb-4">
      <p className="mb-1 text-sm sm:text-base font-medium">Max Price</p>
      <input
        type="number"
        placeholder="Enter maximum price"
        onChange={(e) =>
          setFilters({ ...filters, maxPrice: e.target.value })
        }
        className="
          border
          w-full
          p-2
          rounded
          bg-orange-50
          text-sm
          sm:text-base
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
        "
      />
    </div>

    {/* Rating */}
    <div className="mb-4">
      <p className="mb-1 text-sm sm:text-base font-medium">Rating</p>
      <select
        onChange={(e) =>
          setFilters({ ...filters, rating: e.target.value })
        }
        className="
          border
          w-full
          p-2
          rounded
          bg-orange-50
          text-sm
          sm:text-base
          truncate
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
        "
      >
        <option value="">All Ratings</option>
        <option value="4">4+ Stars</option>
        <option value="3">3+ Stars</option>
      </select>
    </div>

    {/* Amenities */}
    <div className="mb-4">
      <p className="mb-2 text-sm sm:text-base font-medium">Amenities</p>

      <div className="space-y-2">
        {["wifi", "pool", "parking"].map((item) => (
          <label
            key={item}
            className="
              flex
              items-center
              gap-2
              text-sm
              sm:text-base
              break-words
            "
          >
            <input
              type="checkbox"
              value={item}
              onChange={(e) => {
                let updated = filters.amenities || [];

                if (e.target.checked) {
                  updated = [...updated, item];
                } else {
                  updated = updated.filter((a) => a !== item);
                }

                setFilters({ ...filters, amenities: updated });
              }}
            />
            <span className="truncate capitalize">{item}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Apply Button */}
    <button
      onClick={applyFilters}
      className="
        bg-blue-600
        text-white
        w-full
        mt-4
        p-3
        rounded-lg
        hover:scale-105
        transition-transform
        duration-300
        cursor-pointer
        text-sm
        sm:text-base
      "
    >
      Apply Filters
    </button>
  </div>
);
}

export default FilterSidebar;