 function FilterSidebar({ filters, setFilters, applyFilters }) {
  return (
 <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3">
        <h2 className="text-xl font-bold text-white">
          ⚙️ Filters
        </h2>

        <p className="text-blue-100 text-sm mt-1">
          Find your perfect stay
        </p>
      </div>

      <div className="p-4">

        {/* Min Price */}
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            💰 Minimum Price
          </p>

          <input
            type="number"
            placeholder="Enter minimum price"
            onChange={(e) =>
              setFilters({
                ...filters,
                minPrice: e.target.value,
              })
            }
            className="
              w-full
              px-4
              py-2.5
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        {/* Max Price */}
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            💸 Maximum Price
          </p>

          <input
            type="number"
            placeholder="Enter maximum price"
            onChange={(e) =>
              setFilters({
                ...filters,
                maxPrice: e.target.value,
              })
            }
            className="
              w-full
              px-4
              py-2.5
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        {/* Rating */}
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            ⭐ Rating
          </p>

          <select
            onChange={(e) =>
              setFilters({
                ...filters,
                rating: e.target.value,
              })
            }
            className="
              w-full
              px-4
              py-2.5
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            <option value="">All Ratings</option>
            <option value="4">⭐ 4+ Stars</option>
            <option value="3">⭐ 3+ Stars</option>
          </select>
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            🏊 Amenities
          </p>

          <div className="space-y-1.5">
            {["wifi", "pool", "parking"].map((item) => (
              <label
                key={item}
                className="
                  flex
                  items-center
                  gap-2
                  p-2
                  rounded-xl
                  bg-gray-50
                  hover:bg-blue-50
                  transition
                  cursor-pointer
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
                      updated = updated.filter(
                        (a) => a !== item
                      );
                    }

                    setFilters({
                      ...filters,
                      amenities: updated,
                    });
                  }}
                />

                <span className="capitalize font-medium text-gray-700">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="
            w-full
            py-2
            rounded-xl
            font-semibold
            text-white
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            hover:shadow-lg
            transition-all
            duration-300
          "
        >
          Apply Filters ✨
        </button>

      </div>
    </div>
);
}

export default FilterSidebar;