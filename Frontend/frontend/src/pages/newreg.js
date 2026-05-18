 import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
   const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  // ----------------------------
  // VALIDATIONS
  // ----------------------------
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }; 

  const togglePassword = () => {
  setShowPassword((prev) => !prev);
};
  /* const handleSubmit = async () => {
      try {
    if (!form.name || !form.email || !form.password) {
      alert("All fields required");
      return;
    }

    await registerUser(form);
    alert("Registered Successfully");
    navigate("/login");

  } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";

    alert(message);
    console.log(err.response?.data || err.message);
  }
  }; */
  
   const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!isStrongPassword(form.password)) {
      toast.error(
        "Password must be 8+ chars, include 1 uppercase & 1 number"
      );
      return;
    }

    try {
      setLoading(true);

      await registerUser(form);

      toast.success("Registered Successfully 🎉");

      navigate("/login");

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };
 return (
  <>
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-4 max-w-md mx-auto flex flex-col border-slate-300 rounded-lg shadow-lg hover:scale-105 transition duration-300">

        {/* Logo */}
        <div className="item-center ml-27">
          <svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0,5)">
              <circle cx="25" cy="20" r="18" fill="#2563EB" />
              <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
            </g>
            <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed"></text>
          </svg>
        </div>

        <div className="mt-2 ml-10 font-serif w-full">
          <p className="text-xl text-gray-400 w-[100%]">Welcome To SafarSetu</p>
        </div>

        <h2 className="text-xl font-bold mb-4 ml-24">Register</h2>

        {/* Name */}
        <span className="font-semibold text-gray-500">Name:</span>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full mb-2 border-gray-300 rounded-lg"
        />

        {/* Email */}
        <span className="font-semibold text-gray-500">Email:</span>
        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full mb-2 border-gray-300 rounded-lg"
        />

        {/* Password with toggle button INSIDE input wrapper */}
        <span className="font-semibold text-gray-500">Password:</span>
        <div className="relative w-full mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 pr-10 w-full border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:scale-103 cursor-pointer"
        >
          Register
        </button>
      </div>
    </div>
  </>
);
}

export default Register;