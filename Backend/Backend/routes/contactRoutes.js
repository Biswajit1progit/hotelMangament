const express = require("express")
const router = express.Router()
const { BrevoClient } = require("@getbrevo/brevo")

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, role = "user" } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const sender = {
      name: "SafarSetu",
      email: process.env.FROM_EMAIL
    }

    // ── 1. Email to company ──────────────────────────────
    await brevo.transactionalEmails.sendTransacEmail({
      sender,
      to: [{ email: process.env.EMAIL_USER }],
      replyTo: { email },
      subject: `[${role.toUpperCase()}] ${subject} — from ${name}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>SafarSetu — Contact Query</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `
    })

    // ── 2. Auto-reply to user ────────────────────────────
    await brevo.transactionalEmails.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "We received your query — SafarSetu",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Hi ${name}!</h2>
          <p>Thank you for reaching out to SafarSetu.</p>
          <p>Our team will get back to you within <strong>24 hours</strong>.</p>
          <p><strong>Your query:</strong> ${subject}</p>
        </div>
      `
    })

    console.log("✅ Emails sent via Brevo API")
    return res.json({ success: true, message: "Query sent successfully" })

  } catch (err) {
    console.error("Contact email error:", err.message)
    return res.status(500).json({ error: "Failed to send message. Please try again." })
  }
})

module.exports = router