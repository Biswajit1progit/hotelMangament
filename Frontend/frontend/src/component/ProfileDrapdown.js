import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import { useEffect, useRef } from "react";

const ProfileDropdown = ({ close }) => {
  const ref  = useRef();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Logout fix: replace current page with "/" so back never returns
  // to a protected page like /payment ──────────────────────────────────────
  const handleLogout = () => {
    logoutUser();
    sessionStorage.clear();
    close();
    navigate("/", { replace: true });
  };

  return (
    <div
      ref={ref}
      className="absolute right-4 top-14 bg-white shadow-lg rounded-lg p-4 w-60 z-50 border border-gray-300 cursor-pointer"
    >
      {user ? (
        <>
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <svg width="160" height="50" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#091fed">
                SafarSetu
              </text>
            </svg>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 mb-1">
            <div className="border rounded-full p-1 bg-gray-100 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                  d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          <hr className="my-2" />

          <button
            onClick={() => { close(); navigate("/profile"); }}
            className="block w-full text-left hover:bg-gray-50 hover:shadow-sm p-2 rounded text-sm transition"
          >
            👤 Profile
          </button>

          <button
            onClick={() => { close(); navigate("/wishlist"); }}
            className="block w-full text-left hover:bg-gray-50 hover:shadow-sm p-2 rounded text-sm mt-1 transition"
          >
            ❤️ Wishlist
          </button>

          <hr className="my-2" />

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 p-2 rounded text-sm font-semibold text-red-500 hover:bg-red-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Logout
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">Not logged in</p>
          <button
            onClick={() => { close(); navigate("/login"); }}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
          >
            Login
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;