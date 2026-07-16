// Assumes pdfkit is already a dependency (used by your hotel invoice
// generator — utils/generateInvoicepdf.js). If your actual generator uses
// a different library (puppeteer/html-pdf/etc.), let me know and I'll
// rewrite this to match instead of introducing a second PDF approach.

const PDFDocument = require("pdfkit");

function generateMovieInvoicePDF(booking) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(22).fillColor("#1a1a1a").text("SafarSetu", { align: "left" });
      doc.fontSize(10).fillColor("#888").text("Movie Ticket Invoice", { align: "left" });
      doc.moveDown(1.5);

      // Movie details
      doc.fontSize(16).fillColor("#1a1a1a").text(booking.movieTitle);
      doc.fontSize(11).fillColor("#666").text(booking.theaterName);
      doc.moveDown(1);

      doc.fontSize(10).fillColor("#888").text("SHOW DETAILS", { underline: false });
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Date: ${new Date(booking.showDate).toDateString()}`);
      doc.text(`Time: ${booking.showTime}`);
      doc.text(`Seats: ${booking.seats.join(", ")}`);
      doc.moveDown(1);

      doc.fontSize(10).fillColor("#888").text("BOOKED BY");
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Name: ${booking.name}`);
      doc.text(`Email: ${booking.email}`);
      if (booking.phone) doc.text(`Phone: ${booking.phone}`);
      doc.moveDown(1.5);

      // Invoice table
      doc.fontSize(10).fillColor("#888").text("INVOICE");
      doc.moveDown(0.3);
      const tableTop = doc.y;
      doc.fontSize(11).fillColor("#333");
      doc.text("Tickets", 50, tableTop);
      doc.text(`Rs. ${booking.totalPrice}`, 400, tableTop, { align: "right" });
      doc.moveTo(50, tableTop + 20).lineTo(545, tableTop + 20).strokeColor("#eee").stroke();

      doc.fontSize(13).fillColor("#1a1a1a");
      doc.text("Total Paid", 50, tableTop + 30);
      doc.text(`Rs. ${booking.totalPrice}`, 400, tableTop + 30, { align: "right" });
      doc.moveDown(3);

      // Booking ID footer
      doc.fontSize(9).fillColor("#aaa");
      doc.text(`Booking ID: ${booking._id}`);
      if (booking.razorpayPaymentId) doc.text(`Payment ID: ${booking.razorpayPaymentId}`);
      doc.text(`Status: ${booking.status}`);
      doc.moveDown(1);
      doc.fontSize(8).fillColor("#ccc").text(
        `Generated on ${new Date().toLocaleDateString("en-IN")} — SafarSetu`,
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateMovieInvoicePDF;