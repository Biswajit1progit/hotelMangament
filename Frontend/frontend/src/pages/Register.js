import { useState } from "react";
import { registerUser, googleAuthUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const ROLES = [
  { value: "user",       label: "🧳 Guest",       desc: "Search & book hotels"      },
  { value: "hotelOwner", label: "🏨 Hotel Owner",  desc: "List & manage your hotel"  },
  { value: "admin",      label: "🔐 Admin",        desc: "Platform administration"    },
];

function Register() {
  const [form, setForm]             = useState({ name: "", email: "", password: "", role: "user", adminSecret: "" });
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const isValidEmail     = (e) => /\S+@\S+\.\S+/.test(e);
  const isStrongPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("All fields are required");
    if (!isValidEmail(form.email))       return toast.error("Invalid email format");
    if (!isStrongPassword(form.password)) return toast.error("Password must be 8+ chars, 1 uppercase & 1 number");
    if (form.role === "admin" && !form.adminSecret) return toast.error("Admin secret key required");
    try {
      setLoading(true);
      await registerUser(form);
      setRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  // ── Google signup: replaced raw fetch() with googleAuthUser() ────────────
  // googleAuthUser uses the api instance (withCredentials:true) so the
  // refresh token cookie is received correctly cross-origin.
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleAuthUser({ credential: credentialResponse.credential });
      toast.success("Account created with Google 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Google signup failed");
    } finally { setLoading(false); }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 max-w-md w-full rounded-2xl shadow-lg text-center">
          <div className="text-6xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-500 mb-2">We sent a verification link to:</p>
          <p className="font-semibold text-blue-600 mb-4">{form.email}</p>
          <p className="text-gray-400 text-sm mb-6">
            Click the link in the email to activate your account.<br/>
            Check your spam folder if you don't see it.
          </p>
          <button onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition w-full">
            Go to Login
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Wrong email?{" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => setRegistered(false)}>Go back</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="bg-white p-6 max-w-md w-full rounded-2xl shadow-lg">

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

          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google signup failed")}
              useOneTap={false} theme="outline" size="large" width="100%" text="signup_with"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or register with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-600 mb-2">I am a:</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition text-xs font-medium ${
                    form.role === r.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <span className="text-xl mb-1">{r.label.split(" ")[0]}</span>
                  <span>{r.label.split(" ")[1]}</span>
                  <span className="text-gray-400 font-normal mt-0.5 text-center leading-tight">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <input placeholder="Full Name" onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 w-full mt-1 border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 w-full mt-1 border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Password</label>
              <div className="relative mt-1">
                <input type={showPassword ? "text" : "password"} placeholder="Password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border p-2 pr-10 w-full border-gray-300 rounded-lg text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
            </div>
            {form.role === "admin" && (
              <div>
                <label className="text-sm font-medium text-gray-600">Admin Secret Key</label>
                <input type="password" placeholder="Enter admin secret key"
                  onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
                  className="border p-2 w-full mt-1 border-red-300 rounded-lg text-sm bg-red-50" />
                <p className="text-xs text-red-400 mt-1">Only authorized personnel can register as admin</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg w-full hover:bg-blue-700 transition font-medium disabled:opacity-60">
              {loading ? "Registering..." : `Register as ${ROLES.find(r => r.value === form.role)?.label}`}
            </button>
          </form>

          <p className="text-sm mt-4 text-center text-gray-500">
            Already have an account?{" "}
            <span className="text-blue-600 cursor-pointer font-medium" onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Register;