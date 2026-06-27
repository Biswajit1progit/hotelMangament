import { useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const SUBJECTS = {
  user: [
    "Booking Issue",
    "Payment Problem",
    "Hotel Complaint",
    "Refund Request",
    "Account Issue",
    "General Query",
    "Other",
  ],
  hotelOwner: [
    "Hotel Listing Issue",
    "Payment Not Received",
    "Booking Management",
    "Account Verification",
    "Technical Problem",
    "General Query",
    "Other",
  ],
}

export default function ContactForm({ role = "user", userName = "", userEmail = "" }) {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:    userName  || "",
    email:   userEmail || "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  // ── Read token from sessionStorage (same key used everywhere in SafarSetu) ──
  const token = sessionStorage.getItem("token")

  // ── If user is not logged in, show a gate instead of the form ──────────────
  if (!token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Login required</h3>
        <p className="text-gray-500 text-sm mb-6">
          You need to be logged in to send us a message.<br />
          This helps us link your query to your account and reply faster.
        </p>
        <button
          onClick={() => navigate("/login", { state: { from: "/contact" } })}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
        >
          Login to continue
        </button>
      </div>
    )
  }

  // ── Form submitted ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("All fields are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ── Send JWT so backend can verify the request is from a real user ──
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, role }),
      })

      const data = await res.json()

      if (res.status === 401) {
        // Token expired or tampered — send them to login
        toast.error("Your session expired. Please login again.")
        sessionStorage.clear()
        navigate("/login", { state: { from: "/contact" } })
        return
      }

      if (!res.ok) throw new Error(data.error || "Failed to send")

      setSent(true)
      toast.success("Message sent! We'll reply within 24 hours 📧")
    } catch (err) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4">✉️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm mb-2">We received your query and will reply to</p>
        <p className="font-semibold text-blue-600 mb-4">{form.email}</p>
        <p className="text-gray-400 text-sm mb-6">within 24 hours.</p>
        <button
          onClick={() => {
            setSent(false)
            setForm({ name: userName, email: userEmail, subject: "", message: "" })
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
        >
          Send another message
        </button>
      </div>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {role === "hotelOwner" ? "🏨 Owner Support" : "💬 Contact Us"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {role === "hotelOwner"
            ? "Have an issue with your hotel or bookings? We're here to help."
            : "Have a question or issue? Send us a message and we'll get back to you."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Your Name</label>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Email Address</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Subject</label>
          <select
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-400 transition bg-white"
          >
            <option value="">Select a subject</option>
            {SUBJECTS[role].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Message</label>
          <textarea
            placeholder="Describe your issue or question in detail..."
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={5}
            maxLength={500}
            className="border border-gray-200 rounded-xl px-4 py-2.5 w-full text-sm focus:outline-none focus:border-blue-400 transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60 text-sm"
        >
          {loading ? "Sending..." : "Send Message 📧"}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        We typically respond within 24 hours
      </p>
    </div>
  )
}