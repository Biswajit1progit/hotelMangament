export  const createBooking = async (bookingData) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  return res.json();
};

export const getUserBookings = async (email) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/user/${email}`);
  return res.json();
};