import { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { googleAuthUser } from "../services/authService";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { getUser } from "../utils/auth";

const ROLES = [
  { value: "user",       label: "🧳 Guest"  },
  { value: "hotelOwner", label: "🏨 Owner"  },
  { value: "admin",      label: "🔐 Admin"  },
];

function Login() {
  const [form, setForm]               = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true")
      toast.success("Email verified! You can now login 🎉");
    if (params.get("error") === "invalid-link")
      toast.error("Verification link is invalid or expired");

    // CHANGED: check user object instead of token in sessionStorage
    // (token is now in memory, not sessionStorage)
    if (getUser()) navigate("/");
  }, []);

  // ── Email/password login ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Email and password required");
      return;
    }
    try {
      setLoading(true);
      const data = await loginUser(form);   // sets token in memory + user in sessionStorage
      const role = data?.user?.role || "user";

      if (role !== selectedRole) {
        toast.error(`This account is registered as ${role}, not ${selectedRole}`);
        return;
      }

      toast.success("Login Successful 🎉");

      if (role === "admin")           navigate("/admin/dashboard");
      else if (role === "hotelOwner") navigate("/owner/dashboard");
      else navigate(location.state?.from || "/");

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Login failed";
      if (errorMsg.includes("verify your email")) {
        toast.error("Please verify your email first. Check your inbox.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  // CHANGED: replaced raw fetch() with googleAuthUser() which:
  //   1. Uses api instance (withCredentials:true) so refresh cookie is received
  //   2. Stores token in memory via setUserSession, not sessionStorage("token")
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await googleAuthUser({ credential: credentialResponse.credential });

      toast.success("Login Successful 🎉");

      const role = data.user?.role || "user";
      if (role === "admin")           navigate("/admin/dashboard");
      else if (role === "hotelOwner") navigate("/owner/dashboard");
      else navigate(location.state?.from || "/");

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">

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
          <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
              useOneTap={false}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or login with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2 text-center">Login as:</p>
            <div className="flex gap-2 justify-center">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`flex-1 py-2 px-2 rounded-xl border-2 text-xs font-medium transition ${
                    selectedRole === r.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-sm font-medium text-gray-600">Email:</span>
          <input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 w-full mb-3 mt-1 rounded-lg text-sm"
          />

          <span className="text-sm font-medium text-gray-600">Password:</span>
          <div className="relative mt-1 mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border p-2 pr-10 w-full rounded-lg text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : `Login as ${ROLES.find(r => r.value === selectedRole)?.label}`}
          </button>

          <p className="text-sm mt-4 text-center text-gray-500">
            New user?{" "}
            <span className="text-blue-600 cursor-pointer font-medium" onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;