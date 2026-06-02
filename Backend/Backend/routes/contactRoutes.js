// ─────────────────────────────────────────────────────────────
// backend/routes/contactRoutes.js
// Add to server.js: app.use("/api/contact", contactRoutes)
// npm install resend
// .env: RESEND_API_KEY=re_xxx  COMPANY_EMAIL=you@yourdomain.com
// ─────────────────────────────────────────────────────────────

const express = require("express")
const router  = express.Router()
const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY)

// ── POST /api/contact ─────────────────────────────────────────
// Sends query email to company AND auto-reply to user
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, role = "user" } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // ── 1. Email to company ───────────────────────────────────
    const companyMail = await resend.emails.send({
      from: "SafarSetu Contact <onboarding@resend.dev>",  // ← replace with your verified domain later
      to:   [process.env.EMAIL_USER],                  // company receives it
      replyTo: email,                                     // clicking reply goes to user
      subject: `[${role.toUpperCase()}] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;padding:20px">
          <div style="background:#1a1a1a;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:20px">SafarSetu — Contact Query</h2>
            <span style="background:${role === "hotelOwner" ? "#7c3aed" : "#2563eb"};color:#fff;font-size:12px;padding:3px 10px;border-radius:99px;margin-top:8px;display:inline-block">
              ${role === "hotelOwner" ? "🏨 Hotel Owner" : "🧳 User"}
            </span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888;width:100px">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:600;color:#1a1a1a">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#2563eb">
                  <a href="mailto:${email}" style="color:#2563eb">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#888">Subject</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:600;color:#1a1a1a">${subject}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#888;vertical-align:top">Message</td>
                <td style="padding:10px 0;font-size:14px;color:#555;line-height:1.7">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:12px;background:#f9f9f9;border-radius:8px;font-size:12px;color:#aaa;text-align:center">
              Received on ${new Date().toLocaleDateString("en-IN", { day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit" })}
            </div>
          </div>
        </div>
      `,
    })

    // ── 2. Auto-reply to user ─────────────────────────────────
    const userMail = await resend.emails.send({
      from: "SafarSetu <onboarding@resend.dev>",  // ← replace with your verified domain later
      to:   [email],                               // user receives it
      subject: "We received your query — SafarSetu",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;padding:20px">
          <div style="background:#1a1a1a;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:20px">SafarSetu</h2>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;text-align:center">
            <div style="font-size:48px;margin-bottom:16px">✉️</div>
            <h3 style="font-size:20px;color:#1a1a1a;margin-bottom:8px">We got your message, ${name}!</h3>
            <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:20px">
              Thank you for reaching out to SafarSetu.<br>
              Our team will get back to you within <strong>24 hours</strong>.
            </p>
            <div style="background:#f9f9f9;border-radius:10px;padding:16px;text-align:left;margin-bottom:20px">
              <p style="font-size:12px;color:#888;margin:0 0 6px">Your query:</p>
              <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 8px">${subject}</p>
              <p style="font-size:13px;color:#555;margin:0;line-height:1.6">${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p style="font-size:12px;color:#aaa">
              If urgent, reply directly to this email.
            </p>
          </div>
        </div>
      `,
    })

    // ── Log both results for debugging ────────────────────────
    console.log("✅ Company mail id:", companyMail?.data?.id)
    console.log("✅ User mail id:   ", userMail?.data?.id)

    return res.json({ success: true, message: "Query sent successfully" })

  } catch (err) {
    console.error("Contact email error:", err.message)
    return res.status(500).json({ error: "Failed to send message. Please try again." })
  }
})

module.exports = router