import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import { useState, useEffect, useRef } from "react";
import ProfileDropdown from "./ProfileDrapdown";
import NotificationBell from "./bell";
import DarkModeToggle from "./DarkModeToggle";
import { isDarkMode } from "../utils/darkMode";

export default function Navbar() {
  const navigate = useNavigate();
  const [show, setShow]             = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [dark, setDark]             = useState(isDarkMode());
  const menuRef = useRef(null);
  const user = getUser();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenu(false);
      }
    };
    if (mobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenu]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark-mode"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ── Logout fix: replace current page with "/" so back never returns
  // to a protected page like /payment ──────────────────────────────────────
  const handleLogout = () => {
    logoutUser();
    sessionStorage.clear();
    setMobileMenu(false);
    navigate("/", { replace: true });
  };

  const linkClass = `hover:text-blue-400 transition-colors duration-200 ${
    scrolled ? "text-gray-700" : "text-white"
  }`;

  const iconClass = `p-2 rounded-full transition ${
    scrolled ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white"
  }`;

  const publicLinks = [
    { to: "/",       label: "🏠 Home"   },
    { to: "/hotels", label: "🏨 Hotels" },
  ];

  const authLinks = [
    { to: "/movies",  label: "🎬 Movies"     },
    { to: "/flights", label: "✈️ Flights"    },
    { to: "/events",  label: "🎉 Events"     },
    { to: "/wishlist",label: "❤️ Wishlist"   },
    { to: "/profile", label: "👤 Profile"    },
    { to: "/contact", label: "📨 Contact Us" },
  ];

  const mobileLinks = user ? [...publicLinks, ...authLinks] : publicLinks;

  return (
    <>
      <div className="pt-3 mt-3 px-2 sm:px-4">
        <nav className={`
          px-4 sm:px-6 py-4
          flex items-center justify-between
          border rounded-xl
          sticky top-2 z-50
          transition-all duration-300
          ${scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-gray-200"
            : "bg-white/10 backdrop-blur-sm border-white/20"}
        `}>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="160" height="50" viewBox="0 0 160 50"
              xmlns="http://www.w3.org/2000/svg" className="w-32 sm:w-40">
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path d="M5 28 C18 5, 32 5, 45 20"
                  stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif"
                fontSize="20" fontWeight="600" fill={scrolled ? "#091fed" : "#ffffff"}>
                SafarSetu
              </text>
            </svg>
          </div>

          {/* Desktop Nav links */}
          <ul className="hidden lg:flex gap-8 font-bold">
            <li><Link to="/"        className={linkClass}>Home</Link></li>
            <li><Link to="/movies"  className={linkClass}>Movies</Link></li>
            <li><Link to="/flights" className={linkClass}>Flights</Link></li>
            <li><Link to="/hotels"  className={linkClass}>Hotels</Link></li>
            <li><Link to="/events"  className={linkClass}>Events</Link></li>
            <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
          </ul>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3 relative">
            <DarkModeToggle />
            <button className={iconClass}>🔍</button>
            <NotificationBell />
            <button onClick={() => setShow(!show)} className={iconClass}>👤</button>
            <div className={`
              absolute right-0 top-14 z-50
              origin-top-right transform transition-all duration-300 ease-out
              ${show
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}
            `}>
              <ProfileDropdown close={() => setShow(false)} />
            </div>
          </div>

          {/* Mobile */}
          <div ref={menuRef} className="lg:hidden relative flex items-center gap-1">
            <DarkModeToggle className="w-9 h-9" />

            <button
              className={`p-2 rounded-lg transition font-bold text-lg ${
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle menu"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>

            {mobileMenu && (
              <div className="absolute right-0 top-12 bg-white shadow-xl rounded-2xl p-3 border w-60 z-50 space-y-1">

                {mobileLinks.map(({ to, label }) => (
                  <Link key={to} to={to}
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-500 transition">
                    {label}
                  </Link>
                ))}

                <div className="border-t border-gray-100 my-1" />

                <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">{dark ? "🌙" : "☀️"}</span>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {dark ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <DarkModeToggle className="flex-shrink-0 w-8 h-8" />
                </div>

                {user && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                      <span className="text-sm font-medium text-gray-700">🔔 Notifications</span>
                      <NotificationBell />
                    </div>
                  </>
                )}

                <div className="border-t border-gray-100 my-1" />

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
                    🚪 Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 text-center transition">
                    🔑 Login
                  </Link>
                )}
              </div>
            )}
          </div>

        </nav>
      </div>
    </>
  );
}