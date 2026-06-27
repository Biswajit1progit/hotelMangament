const express = require("express")
const router  = express.Router()
const { BrevoClient } = require("@getbrevo/brevo")
const { verifyToken } = require("../middleware/authMiddleware")

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

// ── verifyToken blocks the request entirely if no valid JWT is present.
//    This is correct here because ContactForm now always sends the token.
//    Any request without a valid token → 401, frontend redirects to /login.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, subject, message, role = "user" } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Extra safety: make sure the email in the body matches the token's user
    // (prevents a logged-in user from submitting on behalf of someone else's email)
    if (req.user?.email && email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: "Email does not match your account" })
    }

    const sender = {
      name:  "SafarSetu",
      email: process.env.FROM_EMAIL,
    }

    // ── 1. Email to company ──────────────────────────────────────────────────
    await brevo.transactionalEmails.sendTransacEmail({
      sender,
      to:      [{ email: process.env.EMAIL_USER }],
      replyTo: { email },
      subject: `[${role.toUpperCase()}] ${subject} — from ${name}`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}
  .header{background:#1a1a1a;padding:24px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:22px}
  .badge{display:inline-block;margin-top:8px;padding:3px 12px;border-radius:99px;font-size:12px;color:#fff;background:${role === "hotelOwner" ? "#7c3aed" : "#2563eb"}}
  .body{padding:28px}
  .label{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  table{width:100%;border-collapse:collapse}
  td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555;vertical-align:top}
  td:first-child{width:100px;color:#888;font-size:13px}
  td:last-child{font-weight:500;color:#1a1a1a}
  .message-box{background:#f9f9f9;border-radius:10px;padding:16px;font-size:14px;color:#555;line-height:1.7;margin-top:16px}
  .footer{background:#f9f9f9;padding:16px;text-align:center;font-size:12px;color:#aaa}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SafarSetu — Contact Query</h1>
      <span class="badge">${role === "hotelOwner" ? "🏨 Hotel Owner" : "🧳 User"}</span>
    </div>
    <div class="body">
      <table>
        <tr><td>Name</td><td>${name}</td></tr>
        <tr><td>Email</td><td><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
        <tr><td>Subject</td><td>${subject}</td></tr>
        <tr><td>User ID</td><td style="font-size:12px;color:#aaa">${req.user?.id || "—"}</td></tr>
      </table>
      <div class="message-box">
        <div class="label">Message</div>
        <p style="margin:8px 0 0">${message.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
    <div class="footer">
      Received on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
    </div>
  </div>
</body>
</html>`,
    })

    // ── 2. Auto-reply to user ────────────────────────────────────────────────
    await brevo.transactionalEmails.sendTransacEmail({
      sender,
      to:      [{ email }],
      subject: "We received your query — SafarSetu",
      htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}
  .header{background:#1a1a1a;padding:32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:24px}
  .body{padding:40px 32px;text-align:center}
  .emoji{font-size:48px;margin-bottom:16px}
  h2{font-size:20px;color:#1a1a1a;margin-bottom:8px}
  p{font-size:14px;color:#666;line-height:1.7;margin-bottom:20px}
  .query-box{background:#f9f9f9;border-radius:10px;padding:16px;text-align:left;margin-bottom:20px}
  .query-label{font-size:12px;color:#888;margin:0 0 6px}
  .query-subject{font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 8px}
  .query-message{font-size:13px;color:#555;margin:0;line-height:1.6}
  .footer{background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#aaa}
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SafarSetu</h1></div>
    <div class="body">
      <div class="emoji">✉️</div>
      <h2>We got your message, ${name}!</h2>
      <p>Thank you for reaching out to SafarSetu.<br>
      Our team will get back to you within <strong>24 hours</strong>.</p>
      <div class="query-box">
        <p class="query-label">Your query:</p>
        <p class="query-subject">${subject}</p>
        <p class="query-message">${message.replace(/\n/g, "<br>")}</p>
      </div>
      <p style="font-size:12px;color:#aaa">If urgent, reply directly to this email.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} SafarSetu. All rights reserved.</div>
  </div>
</body>
</html>`,
    })

    console.log(`✅ Contact email sent — user: ${req.user?.id} (${email})`)
    return res.json({ success: true, message: "Query sent successfully" })

  } catch (err) {
    console.error("Contact email error:", err.message)
    return res.status(500).json({ error: "Failed to send message. Please try again." })
  }
})

module.exports = router