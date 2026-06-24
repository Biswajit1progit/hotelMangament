import jsPDF from "jspdf";

export const generatePDF = (data) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Hotel Booking Invoice", 10, 10);

  doc.setFontSize(12);
  doc.text(`Order: ${data.orderNumber}`, 10, 20);
  doc.text(`Transaction: ${data.razorpayPaymentId}`, 10, 30);

  // ✅ ADDED — payment date/time, same source as Invoice.jsx (data.createdAt)
  const paidOn = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";
  doc.text(`Paid On: ${paidOn}`, 10, 40);

  doc.text(`Name: ${data.name}`, 10, 50);
  doc.text(`Hotel: ${data.hotelName}`, 10, 60);

  // ✅ ADDED — stay dates, same source as Invoice.jsx (data.checkIn / data.checkOut)
  const formatDateOnly = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  doc.text(`Check-in: ${formatDateOnly(data.checkIn)}`, 10, 70);
  doc.text(`Check-out: ${formatDateOnly(data.checkOut)}`, 10, 80);

  doc.text(`Rooms: ${data.rooms}`, 10, 90);
  doc.text(`Guests: ${data.guests}`, 10, 100);
  doc.text(`Nights: ${data.nights}`, 10, 110);

  doc.text(`Amount: ₹${data.amount}`, 10, 120);

  doc.text(`GST: ₹${Math.round(data.amount * 0.18)}`, 10, 130);
  doc.text(`Total: ₹${Math.round(data.amount * 1.18)}`, 10, 140);

  doc.save("invoice.pdf");
};
export default generatePDF;