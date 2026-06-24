const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ✅ ADDED — payment timestamp needs time-of-day too, unlike checkIn/checkOut
// which are just calendar dates for a stay. Reads from data.createdAt,
// which comes from the Payment document's Mongoose timestamps.
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Invoice = ({ data }) => {
  if (!data) return null;

  return (
    <div id="invoice" className="p-6 bg-white shadow rounded w-full max-w-xl flex flex-col items-center">

      {/* Logo */}
      <div>
        <svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,5)">
            <circle cx="25" cy="20" r="18" fill="#2563EB" />
            <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
          </g>
          <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">
            SafarSetu
          </text>
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-green-600 mt-3">Booking Invoice</h2>

      {/* Company */}
      <div className="mb-4 text-center">
        <p><b>SafarSetu Pvt Ltd</b></p>
        <p>GST: 22AAAAA0000A1Z5</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 text-center">
        <p><b>Order No:</b> {data.orderNumber}</p>
        <p><b>Transaction ID:</b> {data.razorpayPaymentId}</p>
        {/* ✅ ADDED — payment timestamp, distinct from check-in/check-out
            stay dates below. Comes from Payment doc's createdAt. */}
        <p><b>Paid On:</b> {formatDateTime(data.createdAt)}</p>
      </div>

      {/* User */}
      <div className="mb-4 text-center">
        <p><b>Name:</b> {data.name}</p>
        <p><b>Email:</b> {data.email}</p>
      </div>

      {/* ✅ ADDED — Check-in / Check-out dates as a clean pill row.
          Reads from data.checkIn / data.checkOut which come from the
          Booking document. Only rendered if the fields are present so
          old invoices without dates don't show empty/N/A rows. */}
      {(data.checkIn || data.checkOut) && (
        <div className="flex gap-3 mb-4 flex-wrap justify-center">
          {data.checkIn && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Check-in: {formatDate(data.checkIn)}
            </span>
          )}
          {data.checkOut && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Check-out: {formatDate(data.checkOut)}
            </span>
          )}
        </div>
      )}

      {/* Booking table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Hotel</th>
            <th className="border p-2">Rooms</th>
            <th className="border p-2">Guests</th>
            <th className="border p-2">Nights</th>
            <th className="border p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">{data.hotelName}</td>
            <td className="border p-2">{data.rooms}</td>
            <td className="border p-2">{data.guests}</td>
            <td className="border p-2">{data.nights}</td>
            <td className="border p-2">₹{data.amount}</td>
          </tr>
        </tbody>
      </table>

      {/* GST + Total */}
      <div className="mt-4 text-right w-full">
        <p>GST (18%): ₹{Math.round(data.amount * 0.18)}</p>
        <p className="font-bold text-lg">Total: ₹{Math.round(data.amount * 1.18)}</p>
      </div>

    </div>
  );
};

export default Invoice;