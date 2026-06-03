// ─────────────────────────────────────────────────────────────
// backend/services/emailService.js
// All emails for SafarSetu:
// 1. sendVerificationEmail  ← after register
// 2. sendWelcomeEmail       ← after email verified or Google signup
// 3. sendPaymentConfirmation ← after payment success
// Using Brevo SMTP (free, works on Render, any email address)
// .env:
//   BREVO_USER = your_brevo_login@gmail.com
//   BREVO_PASS = xsmtpsib-xxxxxxxxxxxxxxxx
//   EMAIL_USER = biswajitsahookalia@gmail.com
//   FRONTEND_URL = https://safersetu.netlify.app
//   BACKEND_URL  = https://your-app.onrender.com
// ─────────────────────────────────────────────────────────────

const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host:   "smtp-relay.brevo.com",
  port:   465,
  secure: true,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
})

// Verify on startup
;(async () => {
  try {
    await transporter.verify()
    console.log("✅ Email service ready (Brevo SMTP)")
  } catch (err) {
    console.error("❌ Email service error:", err.message)
  }
})()

async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    const info = await transporter.sendMail({
      from:        `"SafarSetu" <${process.env.FROM_EMAIL}>`, // ← shows as sender
      to:          Array.isArray(to) ? to.join(",") : to,
      subject,
      html,
      attachments,
    })
    console.log(`✅ Email sent → ${to} | id: ${info.messageId}`)
    return info
  } catch (err) {
    console.error("❌ sendEmail failed:", err.message)
    throw err
  }
}

// ─────────────────────────────────────────────────────────────
// EMAIL 1: Verification email — sent after register
// User clicks link to activate account
// ─────────────────────────────────────────────────────────────
async function sendVerificationEmail({ to, userName, token }) {
  const verifyLink = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify/${token}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}
  .header{background:#1a1a1a;padding:32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:24px}
  .body{padding:40px 32px;text-align:center}
  .emoji{font-size:48px;margin-bottom:20px}
  h2{font-size:20px;color:#1a1a1a;margin-bottom:12px}
  p{font-size:14px;color:#666;line-height:1.7;margin-bottom:20px}
  .btn{display:inline-block;padding:14px 36px;background:#1a1a1a;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px}
  .note{font-size:12px;color:#aaa}
  .footer{background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#aaa}
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SafarSetu</h1></div>
    <div class="body">
      <div class="emoji">✉️</div>
      <h2>Verify your email, ${userName}</h2>
      <p>Thanks for registering! Click the button below to verify your email address and activate your account.</p>
      <a href="${verifyLink}" class="btn">Verify Email</a>
      <p class="note">This link expires in 24 hours.<br>If you didn't create an account, ignore this email.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} SafarSetu</div>
  </div>
</body>
</html>`

  return sendEmail({ to, subject: "Verify your SafarSetu account", html })
}

// ─────────────────────────────────────────────────────────────
// EMAIL 2: Welcome email — after verification or Google signup
// ─────────────────────────────────────────────────────────────
async function sendWelcomeEmail({ to, userName }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}
  .header{background:#1a1a1a;padding:32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:24px}
  .body{padding:40px 32px;text-align:center}
  .emoji{font-size:48px;margin-bottom:20px}
  h2{font-size:22px;color:#1a1a1a;margin-bottom:12px}
  p{font-size:14px;color:#666;line-height:1.7}
  .btn{display:inline-block;margin-top:24px;padding:14px 36px;background:#1a1a1a;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px}
  .footer{background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#aaa}
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SafarSetu</h1></div>
    <div class="body">
      <div class="emoji">🏨</div>
      <h2>Welcome, ${userName}!</h2>
      <p>Your account is verified and ready.<br>Start exploring 130+ hotels across India.</p>
      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="btn">Explore Hotels</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} SafarSetu</div>
  </div>
</body>
</html>`

  return sendEmail({ to, subject: "Welcome to SafarSetu 🏨", html })
}

// ─────────────────────────────────────────────────────────────
// EMAIL 3: Payment confirmation with invoice
// Called after Razorpay payment verified
// ─────────────────────────────────────────────────────────────
async function sendPaymentConfirmation({ to, userName, hotel, booking, pdfBuffer }) {
  const { bookingId, checkIn, checkOut, amount, nights = 1, paymentId, paymentDate } = booking

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}
  .header{background:#1a1a1a;padding:32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:24px}
  .header p{color:#888;margin:6px 0 0;font-size:14px}
  .success{background:#e6f7ee;color:#1a9e5c;text-align:center;padding:20px;font-size:18px;font-weight:600}
  .body{padding:32px}
  .label{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
  .hotel-card{background:#f9f9f9;border-radius:12px;padding:18px;margin-bottom:20px}
  .hotel-name{font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:4px}
  .hotel-loc{font-size:13px;color:#888}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555}
  td:last-child{text-align:right;font-weight:500;color:#1a1a1a}
  .total td{border:none;font-size:17px;font-weight:700;color:#1a1a1a;padding-top:14px}
  .booking-id{background:#f5f5f5;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:13px;color:#555;margin-bottom:20px}
  p{font-size:13px;color:#888;line-height:1.7}
  .footer{background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#aaa}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SafarSetu</h1>
      <p>Your travel companion</p>
    </div>
    <div class="success">✓ Booking Confirmed</div>
    <div class="body">
      <p style="font-size:15px;color:#333;margin-bottom:20px">Hi ${userName}, your booking is confirmed!</p>

      <p class="label">Hotel</p>
      <div class="hotel-card">
        <div class="hotel-name">${hotel.name}</div>
        <div class="hotel-loc">${hotel.location || hotel.city || ""}</div>
      </div>

      <p class="label">Stay Dates</p>
      <table style="margin-bottom:20px">
        <tr>
          <td style="color:#555">Payment Date</td>
          <td>${new Date(paymentDate || Date.now()).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}</td>
        </tr>
        <tr>
          <td style="border:none;padding-right:6px">
            <div style="background:#f9f9f9;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:10px;color:#aaa;text-transform:uppercase;margin-bottom:4px">Check-in</div>
              <div style="font-size:14px;font-weight:600;color:#1a1a1a">${new Date(checkIn).toDateString()}</div>
            </div>
          </td>
          <td style="border:none;padding-left:6px">
            <div style="background:#f9f9f9;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:10px;color:#aaa;text-transform:uppercase;margin-bottom:4px">Check-out</div>
              <div style="font-size:14px;font-weight:600;color:#1a1a1a">${new Date(checkOut).toDateString()}</div>
            </div>
          </td>
        </tr>
      </table>

      <p class="label">Invoice</p>
      <table>
        <tr><td>₹${hotel.price} × ${nights} night${nights > 1 ? "s" : ""}</td><td>₹${hotel.price * nights}</td></tr>
        <tr><td>Taxes & fees (18% GST)</td><td>₹${Math.round(hotel.price * nights * 0.18)}</td></tr>
        <tr class="total"><td>Total Paid</td><td>₹${amount}</td></tr>
      </table>

      <p class="label">Booking ID</p>
      <div class="booking-id">
        🎫 ${bookingId}<br>
        <span style="font-size:11px;color:#aaa">Payment ID: ${paymentId}</span>
      </div>

      <p>Show this booking ID at hotel reception.<br>
      For help, contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#1a1a1a">${process.env.EMAIL_USER}</a></p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} SafarSetu. All rights reserved.</div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: `✓ Booking Confirmed — ${hotel.name} | SafarSetu`,
    html,
    attachments: pdfBuffer ? [
      {
        filename:    `SafarSetu-Invoice-${booking.bookingId}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      }
    ] : [],
  })
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPaymentConfirmation }