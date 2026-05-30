 // ─────────────────────────────────────────────────────────────
// backend/utils/generateInvoicePDF.js
// Generates invoice PDF matching your existing Invoice component
// Uses pdfkit — install: npm install pdfkit --legacy-peer-deps
// ─────────────────────────────────────────────────────────────

const PDFDocument = require("pdfkit")

async function generateInvoicePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" })
    const buffers = []

    doc.on("data", (chunk) => buffers.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(buffers)))
    doc.on("error", reject)

    const pageWidth = doc.page.width
    const centerX = pageWidth / 2

    // ── Header — SafarSetu branding ───────────────────────────
    doc
      .fontSize(22)
      .fillColor("#2563EB")
      .font("Helvetica-Bold")
      .text("SafarSetu", { align: "center" })

    doc
      .fontSize(18)
      .fillColor("#16a34a")
      .font("Helvetica-Bold")
      .text("Booking Invoice", { align: "center" })
      .moveDown(0.5)

    // ── Divider ───────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .strokeColor("#e5e7eb")
      .stroke()
      .moveDown(0.5)

    // ── Company info ──────────────────────────────────────────
    doc
      .fontSize(11)
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("SafarSetu Pvt Ltd", { align: "center" })
      .font("Helvetica")
      .fillColor("#555")
      .text("GST: 22AAAAA0000A1Z5", { align: "center" })
      .moveDown(0.8)

    // ── Order info ────────────────────────────────────────────
    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("Order No: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(data.orderNumber || "N/A", { align: "center" })

    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("Transaction ID: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(data.razorpayPaymentId || "N/A", { align: "center" })
      .moveDown(0.5)

    // ── Payment date ──────────────────────────────────────────
    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("Payment Date: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(new Date(data.createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      }), { align: "center" })
      .moveDown(0.8)

    // ── Divider ───────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .strokeColor("#e5e7eb")
      .stroke()
      .moveDown(0.5)

    // ── User info ─────────────────────────────────────────────
    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("Name: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(data.name || "N/A")

    doc
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text("Email: ", { continued: true })
      .font("Helvetica")
      .fillColor("#555")
      .text(data.email || "N/A")
      .moveDown(0.8)

    // ── Table header ──────────────────────────────────────────
    const tableTop = doc.y
    const colWidths = [150, 70, 70, 70, 90]
    const colHeaders = ["Hotel", "Rooms", "Guests", "Nights", "Amount"]
    const tableLeft = 50

    // Table header background
    doc
      .rect(tableLeft, tableTop, pageWidth - 100, 25)
      .fillColor("#e5e7eb")
      .fill()

    // Table header text
    let xPos = tableLeft
    colHeaders.forEach((header, i) => {
      doc
        .fontSize(10)
        .fillColor("#1a1a1a")
        .font("Helvetica-Bold")
        .text(header, xPos + 5, tableTop + 7, {
          width: colWidths[i],
          align: "center"
        })
      xPos += colWidths[i]
    })

    // ── Table row ─────────────────────────────────────────────
    const rowTop = tableTop + 25
    doc
      .rect(tableLeft, rowTop, pageWidth - 100, 25)
      .fillColor("#f9fafb")
      .fill()

    xPos = tableLeft
    const rowData = [
      data.hotelName || "N/A",
      String(data.rooms || 1),
      String(data.guests || 1),
      String(data.nights || 1),
      `Rs.${data.amount || 0}`,
    ]

    rowData.forEach((cell, i) => {
      doc
        .fontSize(10)
        .fillColor("#555")
        .font("Helvetica")
        .text(cell, xPos + 5, rowTop + 7, {
          width: colWidths[i],
          align: "center"
        })
      xPos += colWidths[i]
    })

    // Table border
    doc
      .rect(tableLeft, tableTop, pageWidth - 100, 50)
      .strokeColor("#d1d5db")
      .stroke()

    doc.moveDown(3)

    // ── GST and Total ─────────────────────────────────────────
    const gst = Math.round(data.amount * 0.18)
    const total = Math.round(data.amount * 1.18)

    doc
      .fontSize(11)
      .fillColor("#555")
      .font("Helvetica")
      .text(`GST (18%): Rs.${gst}`, { align: "right" })

    doc
      .fontSize(13)
      .fillColor("#1a1a1a")
      .font("Helvetica-Bold")
      .text(`Total: Rs.${total}`, { align: "right" })
      .moveDown(1.5)

    // ── Divider ───────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .strokeColor("#e5e7eb")
      .stroke()
      .moveDown(0.8)

    // ── Footer ────────────────────────────────────────────────
    doc
      .fontSize(9)
      .fillColor("#aaa")
      .font("Helvetica")
      .text("Thank you for booking with SafarSetu!", { align: "center" })
      .text("Show this invoice at hotel reception.", { align: "center" })
      .text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, { align: "center" })

    doc.end()
  })
}

module.exports = generateInvoicePDF