// ─────────────────────────────────────────────────────────────
// src/components/Skeleton.jsx
// One file — all shimmer skeletons for the entire project
// ─────────────────────────────────────────────────────────────

// ── Base shimmer box ──────────────────────────────────────────
export function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg ${className}`}
      style={{ backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite" }}
    />
  )
}

// ── 1. Hotel card skeleton ────────────────────────────────────
export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Image — shorter on mobile */}
      <Shimmer className="w-full h-40 sm:h-48 rounded-none" />
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <Shimmer className="h-4 sm:h-5 w-3/4" />
        <Shimmer className="h-3 sm:h-4 w-1/2" />
        <div className="flex gap-2">
          <Shimmer className="h-3 sm:h-4 w-14 sm:w-16" />
          <Shimmer className="h-3 sm:h-4 w-14 sm:w-16" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-5 sm:h-6 w-20 sm:w-24" />
          <Shimmer className="h-8 sm:h-9 w-20 sm:w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Hotel listing page skeleton ───────────────────────────────
export function HotelListingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <HotelCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── 2. Hotel detail page skeleton ─────────────────────────────
export function HotelDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Image gallery */}
      <Shimmer className="w-full h-52 sm:h-72 rounded-2xl" />

      {/* Title + button row — stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-6 sm:h-7 w-2/3" />
          <Shimmer className="h-3 sm:h-4 w-1/3" />
        </div>
        <Shimmer className="h-9 sm:h-10 w-full sm:w-24 rounded-xl" />
      </div>

      {/* Tags row — wraps on small screens */}
      <div className="flex flex-wrap gap-2">
        <Shimmer className="h-6 sm:h-7 w-16 sm:w-20 rounded-full" />
        <Shimmer className="h-6 sm:h-7 w-20 sm:w-24 rounded-full" />
        <Shimmer className="h-6 sm:h-7 w-14 sm:w-16 rounded-full" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Shimmer className="h-3 sm:h-4 w-full" />
        <Shimmer className="h-3 sm:h-4 w-5/6" />
        <Shimmer className="h-3 sm:h-4 w-4/6" />
      </div>

      {/* Amenities — 2 cols mobile → 3 cols sm+ */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 space-y-3">
        <Shimmer className="h-4 sm:h-5 w-28 sm:w-32" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-7 sm:h-8 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Booking card */}
      <div className="bg-white border rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
        <Shimmer className="h-5 sm:h-6 w-36 sm:w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Shimmer className="h-11 sm:h-12 rounded-xl" />
          <Shimmer className="h-11 sm:h-12 rounded-xl" />
        </div>
        <Shimmer className="h-11 sm:h-12 w-full rounded-xl" />
        <Shimmer className="h-11 sm:h-12 w-full rounded-xl" />
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        <Shimmer className="h-5 sm:h-6 w-28 sm:w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-3">
              <Shimmer className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <Shimmer className="h-3 sm:h-4 w-28 sm:w-32" />
                <Shimmer className="h-2.5 sm:h-3 w-16 sm:w-20" />
              </div>
            </div>
            <Shimmer className="h-3 sm:h-4 w-full" />
            <Shimmer className="h-3 sm:h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 3. Admin dashboard tab skeletons ──────────────────────────

// ── Stat cards (Dashboard tab) ────────────────────────────────
export function StatCardsSkeleton() {
  return (
    <div>
      {/* 2 cols mobile → 3 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 mr-2">
                <Shimmer className="h-3 sm:h-4 w-16 sm:w-24" />
                <Shimmer className="h-6 sm:h-8 w-12 sm:w-16" />
              </div>
              <Shimmer className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent pending requests block */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Shimmer className="h-4 w-32 sm:w-40" />
          <Shimmer className="h-4 w-14 sm:w-16" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2 gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-3 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
            <Shimmer className="h-6 w-14 sm:w-16 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Requests tab ──────────────────────────────────────────────
export function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        {/* Left content */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Shimmer className="h-4 sm:h-5 w-36 sm:w-44" />
            <Shimmer className="h-5 w-14 sm:w-16 rounded-full" />
          </div>
          <Shimmer className="h-3 sm:h-4 w-3/4" />
          <Shimmer className="h-3 sm:h-4 w-2/3" />
          {/* Details block */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mt-1">
            <Shimmer className="h-3 w-1/3" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-3 w-2/5" />
          </div>
          <Shimmer className="h-3 w-20 sm:w-24" />
        </div>
        {/* Right — approve/reject — full width mobile, fixed sm+ */}
        <div className="flex flex-col gap-2 w-full sm:w-48 flex-shrink-0">
          <Shimmer className="h-12 sm:h-14 w-full rounded-lg" />
          <div className="flex gap-2">
            <Shimmer className="h-8 sm:h-9 flex-1 rounded-lg" />
            <Shimmer className="h-8 sm:h-9 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RequestsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-7 sm:h-8 w-12 sm:w-16 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Hotels tab ────────────────────────────────────────────────
export function AdminHotelSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-4 sm:h-5 w-1/2 sm:w-2/5" />
              <Shimmer className="h-3 sm:h-4 w-1/3 sm:w-1/4" />
              <Shimmer className="h-3 w-2/3 sm:w-1/2" />
            </div>
            <Shimmer className="h-6 sm:h-7 w-16 sm:w-20 rounded-full flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────
export function UsersSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 animate-pulse">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-4 sm:h-5 w-28 sm:w-40" />
              <Shimmer className="h-3 sm:h-4 w-36 sm:w-56" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Shimmer className="h-6 sm:h-7 w-16 sm:w-20 rounded-full" />
              <Shimmer className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Bookings tab ──────────────────────────────────────────────
export function BookingsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-4 sm:h-5 w-2/5 sm:w-1/3" />
              <Shimmer className="h-3 sm:h-4 w-3/5 sm:w-2/5" />
              <Shimmer className="h-3 w-full sm:w-3/4" />
            </div>
            <Shimmer className="h-5 sm:h-6 w-16 sm:w-20 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Analytics tab ─────────────────────────────────────────────
export function AnalyticsSkeleton({ count = 3 }) {
  return (
    <div>
      {/* Summary bar: 2 cols mobile → 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm animate-pulse flex flex-col gap-2">
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-5 sm:h-6 w-2/5" />
            <Shimmer className="h-4 sm:h-5 w-5 sm:w-6" />
          </div>
        ))}
      </div>

      {/* Filters row — wraps on mobile */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5 animate-pulse">
        <Shimmer className="h-9 sm:h-10 flex-1 min-w-36 rounded-xl" />
        <Shimmer className="h-9 sm:h-10 w-32 sm:w-36 rounded-xl" />
      </div>

      {/* Hotel analytics cards */}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 animate-pulse">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Image — smaller on mobile */}
              <Shimmer className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <Shimmer className="h-4 sm:h-5 w-1/2" />
                  <Shimmer className="h-5 w-12 sm:w-14 rounded-full" />
                </div>
                <Shimmer className="h-3 w-2/5" />
                <Shimmer className="h-3 w-3/5" />

                {/* Stats row — wraps on very small screens */}
                <div className="flex flex-wrap gap-3 mt-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex flex-col gap-1">
                      <Shimmer className="h-2.5 w-8 sm:w-10" />
                      <Shimmer className="h-4 w-6 sm:w-8" />
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2 mt-1">
                  <Shimmer className="h-7 sm:h-8 w-24 sm:w-28 rounded-lg" />
                  <Shimmer className="h-7 sm:h-8 w-20 sm:w-24 rounded-lg" />
                </div>
              </div>

              {/* Pie circle — hidden on mobile, shown sm+ */}
              <Shimmer className="hidden sm:block w-20 h-20 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}