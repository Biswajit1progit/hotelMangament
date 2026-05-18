import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ROLES = [
  { value: "user", label: "🧳 Guest", desc: "Search & book hotels" },
  { value: "hotelOwner", label: "🏨 Hotel Owner", desc: "List & manage your hotel" },
  { value: "admin", label: "🔐 Admin", desc: "Platform administration" },
];

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", adminSecret: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isStrongPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("All fields are required");
    if (!isValidEmail(form.email)) return toast.error("Invalid email format");
    if (!isStrongPassword(form.password)) return toast.error("Password must be 8+ chars, 1 uppercase & 1 number");
    if (form.role === "admin" && !form.adminSecret) return toast.error("Admin secret key required");

    try {
      setLoading(true);
      await registerUser(form);
      toast.success("Registered Successfully 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-6 max-w-md w-full rounded-2xl shadow-lg">

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0,5)">
              <circle cx="25" cy="20" r="18" fill="#2563EB" />
              <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
            </g>
            <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">SafarSetu</text>
          </svg>
        </div>

        <p className="text-center text-gray-400 font-serif mb-1">Welcome To SafarSetu</p>
        <h2 className="text-xl font-bold text-center mb-4">Create Account</h2>

        {/* ✅ Role Toggle */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-600 mb-2">I am a:</p>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition text-xs font-medium ${
                  form.role === r.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className="text-xl mb-1">{r.label.split(" ")[0]}</span>
                <span>{r.label.split(" ")[1]}</span>
                <span className="text-gray-400 font-normal mt-0.5 text-center leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <input
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 w-full mt-1 border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border p-2 w-full mt-1 border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border p-2 pr-10 w-full border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ✅ Admin Secret Key — only shown when admin role selected */}
          {form.role === "admin" && (
            <div>
              <label className="text-sm font-medium text-gray-600">Admin Secret Key</label>
              <input
                type="password"
                placeholder="Enter admin secret key"
                onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
                className="border p-2 w-full mt-1 border-red-300 rounded-lg text-sm bg-red-50"
              />
              <p className="text-xs text-red-400 mt-1">Only authorized personnel can register as admin</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg w-full hover:bg-blue-700 transition font-medium disabled:opacity-60"
          >
            {loading ? "Registering..." : `Register as ${ROLES.find(r => r.value === form.role)?.label}`}
          </button>
        </form>

        <p className="text-sm mt-4 text-center text-gray-500">
          Already have an account?{" "}
          <span className="text-blue-600 cursor-pointer font-medium" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;