 import jsPDF from "jspdf";

export const generatePDF = (data) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Hotel Booking Invoice", 10, 10);

  doc.setFontSize(12);
  doc.text(`Order: ${data.orderNumber}`, 10, 20);
  doc.text(`Transaction: ${data.razorpayPaymentId}`, 10, 30);

  doc.text(`Name: ${data.name}`, 10, 40);
  doc.text(`Hotel: ${data.hotelName}`, 10, 50);

  doc.text(`Rooms: ${data.rooms}`, 10, 60);
  doc.text(`Guests: ${data.guests}`, 10, 70);
  doc.text(`Nights: ${data.nights}`, 10, 80);

  doc.text(`Amount: ₹${data.amount}`, 10, 90);

  doc.text(`GST: ₹${Math.round(data.amount * 0.18)}`, 10, 100);
  doc.text(`Total: ₹${Math.round(data.amount * 1.18)}`, 10, 110);

  doc.save("invoice.pdf");
};
export default generatePDF;