 export const createOrder = async (amount) => {
  const res = await fetch("http://localhost:5000/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  return res.json();
};

export const verifyPayment = async (data) => {
  await fetch(`${process.env.REACT_APP_API_URL}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const getUserPayments = async (email) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/user/${email}`);
  return res.json();
};


export const refundPayment = async (paymentId) => {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/payment/refund/${paymentId}`,
    {
      method: "PUT",
    }
  );

  return res.json();
};