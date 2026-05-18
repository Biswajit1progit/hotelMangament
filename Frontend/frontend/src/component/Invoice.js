 const Invoice = ({ data }) => {
  if (!data) return null;

  return (
    <div id="invoice" className="p-6 bg-white shadow rounded w-full max-w-xl flex flex-col items-center  ">
       <div className="">
        <svg
      width="160"
      height="50"
      viewBox="0 0 160 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon */}
      <g transform="translate(0,5)">
        <circle cx="25" cy="20" r="18" fill="#2563EB" />

        <path
          d="M5 28 C18 5, 32 5, 45 20"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        <polygon
          points="28,10 42,16 28,20 32,26 24,20 12,22"
          fill="white"
        />
      </g>

      {/* Text */}
      <text
        x="50"
        y="31"
        fontFamily="Poppins, Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#091fed"
      >
        SafarSetu
      </text>
        </svg>
       </div>
      <h2 className="text-2xl font-bold mb-4 text-green-600 mt-3">
        Booking Invoice
      </h2>

      {/* Company */}
      <div className="mb-4">
        <p><b>SaferSetu Pvt Ltd</b></p>
        <p>GST: 22AAAAA0000A1Z5</p>
      </div>

      {/* Order Info */}
      <div className="mb-4">
        <p><b>Order No:</b> {data.orderNumber}</p>
        <p><b>Transaction ID:</b> {data.razorpayPaymentId}</p>
      </div>

      {/* User */}
      <div className="mb-4">
        <p><b>Name:</b> {data.name}</p>
        <p><b>Email:</b> {data.email}</p>
      </div>

      {/* Table */}
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

      {/* GST */}
      <div className="mt-4 text-right">
        <p>GST (18%): ₹{Math.round(data.amount * 0.18)}</p>
        <p className="font-bold text-lg">
          Total: ₹{Math.round(data.amount * 1.18)}
        </p>
      </div>

    </div>
  );
};

export default Invoice;