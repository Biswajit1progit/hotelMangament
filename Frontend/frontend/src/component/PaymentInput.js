 function PaymentInput({ method, input, setInput }) {
 const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Bank of Baroda"
  ];

  if (method === "UPI") {
    return (
      <>
      <hr className="bg-gray-600  mt-3"></hr>
      <div>
        <span>UPI ID:</span>
        <input
          placeholder="Enter UPI ID (example@upi)"
          className="w-full border p-3 mt-4 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      </>
    );
  }

  if (method === "CARD") {
    return (
      <>
       <hr className="bg-gray-600  mt-3"></hr>
      <div className="space-y-4">
        
        {/* Card Number */}
        <div>
          <span>Card Number:</span>
          <input
            placeholder="Enter Card Number"
            className="w-full border p-3 mt-2 rounded"
            value={input.cardNumber || ""}
            onChange={(e) =>
              setInput({ ...input, cardNumber: e.target.value })
            }
          />
        </div>

        {/* Expiry + CVV */}
        <div className="flex gap-4">
          
          {/* Expiry */}
          <div className="w-1/2">
            <span>Expiry:</span>
            <input
              placeholder="MM/YY"
              className="w-full border p-3 mt-2 rounded"
              value={input.expiry || ""}
              onChange={(e) =>
                setInput({ ...input, expiry: e.target.value })
              }
            />
          </div>

          {/* CVV */}
          <div className="w-1/2">
            <span>CVV:</span>
            <input
              placeholder="123"
              type="password"
              className="w-full border p-3 mt-2 rounded"
              value={input.cvv || ""}
              onChange={(e) =>
                setInput({ ...input, cvv: e.target.value })
              }
            />
          </div>

        </div>
      </div>
      </>
    );
  }

  if (method === "NETBANKING") {
    return (
      <>
      <hr className="bg-gray-600  mt-3"></hr>
      {/* <div>
        <span>Bank Name:</span>
        <input
          placeholder="Enter Bank Name"
          className="w-full border p-3 mt-4 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div> */}

      <div className="space-y-4">

        {/* Bank Dropdown */}
        <div>
          <span>Select Bank:</span>
          <select
            className="w-full border p-3 mt-2 rounded"
            value={input.bank || ""}
            onChange={(e) =>
              setInput({ ...input, bank: e.target.value })
            }
          >
            <option value="">-- Select Bank --</option>
            {banks.map((bank, index) => (
              <option key={index} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        {/* Optional: Account Holder Name */}
        <div>
          <span>Account Holder Name:</span>
          <input
            placeholder="Enter Name"
            className="w-full border p-3 mt-2 rounded"
            value={input.accountName || ""}
            onChange={(e) =>
              setInput({ ...input, accountName: e.target.value })
            }
          />
        </div>

      </div>
      </>
    );
  }

}

export default PaymentInput;