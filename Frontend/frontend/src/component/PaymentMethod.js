 function PaymentMethods({ method, setMethod }) {
  return (
    <div className="space-y-3">
     
      <div onClick={() => setMethod("UPI")} className={`p-3 border rounded ${method==="UPI" && "border-blue-600"}`}>
       <svg viewBox="0 0 48 48" width="40" height="40">
  <circle cx="24" cy="24" r="22" fill="#E0E0E0" />
  <text
    x="50%"
    y="55%"
    textAnchor="middle"
    fontSize="14"
    fill="#333"
    fontFamily="Arial"
  >
    UPI
  </text>
      </svg>
        <span>All Type of UPI</span>  
      </div>

      <div onClick={() => setMethod("CARD")} className={`p-3 border rounded ${method==="CARD" && "border-blue-600"}`}>
       <svg viewBox="0 0 48 48" width="40" height="40">
  <rect x="4" y="10" width="40" height="28" rx="4" fill="#1976D2"/>
  <rect x="4" y="16" width="40" height="6" fill="#0D47A1"/>
  <rect x="8" y="26" width="12" height="4" fill="#ffffff"/>
       </svg>
       <span> Credit/Debit Card</span>
      </div>

      <div onClick={() => setMethod("NETBANKING")} className={`p-3 border rounded ${method==="NETBANKING" && "border-blue-600"}`}>
        <svg viewBox="0 0 48 48" width="40" height="40">
  <rect x="6" y="10" width="36" height="28" rx="4" fill="#4CAF50"/>
  <rect x="10" y="14" width="28" height="6" fill="#ffffff"/>
  <rect x="10" y="24" width="18" height="4" fill="#ffffff"/>
        </svg>
        <span>Net Banking</span>
      </div>

    </div>
  );
}

export default PaymentMethods;