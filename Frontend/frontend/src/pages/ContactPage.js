// ─────────────────────────────────────────────────────────────
// src/pages/ContactPage.jsx
// Standalone Contact Us page for regular users
// Route: /contact
// ─────────────────────────────────────────────────────────────

import Hotelnav from "../component/filters/Hotelnav"
import Footer from "../component/footer"
import ContactForm from "../component/ContactForm"
import { getUser } from "../utils/auth"

export default function ContactPage() {
  const user = getUser()

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-16">
        <Hotelnav />
      </div>

      <div className="pt-24 pb-12 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">

          {/* Page header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-4">Contact Us</h1>
            <p className="text-gray-500">
              We're here to help. Send us your query and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "📧", label: "Email", value: "Reply in 24 hours" },
              { icon: "🕐", label: "Support Hours", value: "Mon–Sat 9am–6pm" },
              { icon: "⚡", label: "Response Time", value: "Within 24 hours" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Contact form — prefill with logged in user data */}
          <ContactForm
            role="user"
            userName={user?.name || ""}
            userEmail={user?.email || ""}
          />

        </div>
      </div>

      <Footer />
    </>
  )
}