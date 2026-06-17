import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ── Parcel-safe icon fix (static import, not dynamic) ─────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ── Parse location — handles string, object, or missing ───────
const parseLocation = (location) => {
  if (!location) return null
  if (typeof location === "object" && location.lat && location.lng) {
    return { lat: Number(location.lat), lng: Number(location.lng) }
  }
  if (typeof location === "string") {
    try {
      const parsed = JSON.parse(location)
      if (parsed.lat && parsed.lng) {
        return { lat: Number(parsed.lat), lng: Number(parsed.lng) }
      }
    } catch {
      return null
    }
  }
  return null
}

const HotelMap = ({ location, name }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const coords = parseLocation(location)

  useEffect(() => {
    if (!coords || !mapRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 15)
    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup(`<b>${name || "Hotel"}</b>`)
      .openPopup()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coords?.lat, coords?.lng])

  if (!coords) {
    return (
      <div className="w-full h-48 rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-2 border border-gray-200">
        <span className="text-2xl">📍</span>
        <p className="text-gray-500 text-sm">Location not available</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} style={{ height: "280px", width: "100%" }} />
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <span>📍</span>
          <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        </div>
        <a
          href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  )
}

export default HotelMap