import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../../utils/auth";
import { useState, useEffect, useRef } from "react";
import ProfileDropdown from "../ProfileDrapdown";
import NotificationBell from "../bell";
import DarkModeToggle from "../DarkModeToggle";
import { isDarkMode } from "../../utils/darkMode";

export default function Hotelnav() {
  const navigate = useNavigate();
  const [show, setShow]             = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dark, setDark]             = useState(isDarkMode());
  const [scrolled, setScrolled]     = useState(false); // purely visual, doesn't affect logic
  const menuRef                     = useRef(null);
  const user                        = getUser();

  // ── Close mobile menu on outside click/touch ──────────────
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

  // ── Sync dark state with html class ──────────────────────
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

  // ── Purely cosmetic scroll listener for navbar elevation ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    logoutUser();
    navigate("/login");
  };

  return (
    <>
      <div className="pt-3 mt-3 px-2 sm:px-4">

        {/* ── Navbar — glass effect, animated border glow, smooth elevation ── */}
        <nav
          className={`
            relative flex items-center justify-between
            px-4 sm:px-6 py-4 rounded-2xl border
            bg-white/80 backdrop-blur-xl backdrop-saturate-150
            border-gray-200/70
            transition-all duration-500 ease-out
            ${scrolled ? "shadow-lg shadow-blue-100/50 -translate-y-0.5" : "shadow-md"}
            before:absolute before:inset-0 before:-z-10 before:rounded-2xl
            before:bg-gradient-to-r before:from-blue-500/0 before:via-blue-400/5 before:to-purple-500/0
            hover:before:from-blue-500/5 hover:before:via-purple-400/5 hover:before:to-blue-500/5
            before:transition-opacity before:duration-700
          `}
        >

          {/* Animated gradient accent line on top */}
          <span className="pointer-events-none absolute -top-px left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 transition-all duration-700 ease-out group-hover:w-1/2 opacity-0 group-hover:opacity-100" />

          {/* Logo */}
          <div className="flex items-center gap-2 group/logo cursor-pointer select-none">
            <svg
              width="160" height="50" viewBox="0 0 160 50"
              xmlns="http://www.w3.org/2000/svg"
              className="w-32 sm:w-40 transition-transform duration-500 ease-out group-hover/logo:scale-105"
            >
              <g transform="translate(0,5)" className="origin-center transition-transform duration-700 group-hover/logo:rotate-[6deg]">
                <circle cx="25" cy="20" r="18" fill="#2563EB" className="transition-all duration-500 group-hover/logo:fill-[#3b82f6]" />
                <path d="M5 28 C18 5, 32 5, 45 20"
                  stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31"
                fontFamily="Poppins, Arial, sans-serif"
                fontSize="20" fontWeight="600"
                fill="#091fed"
                className="transition-opacity duration-500 group-hover/logo:opacity-80"
              >
                SafarSetu
              </text>
            </svg>
          </div>

          {/* Desktop Nav links — animated underline on hover */}
          <ul className="hidden lg:flex gap-8 text-gray-700 font-bold">
            {[
              { to: "/",        label: "Home"       },
              { to: "/movies",  label: "Movies"     },
              { to: "/flights", label: "Flights"    },
              { to: "/hotels",  label: "Hotels"     },
              { to: "/events",  label: "Events"     },
              { to: "/contact", label: "Contact Us" },
            ].map(({ to, label }) => (
              <li key={to} className="relative group/link">
                <Link
                  to={to}
                  className="relative inline-block py-1 transition-colors duration-300 group-hover/link:text-blue-600"
                >
                  {label}
                  <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 ease-out group-hover/link:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right section */}
          <div className="hidden lg:flex items-center gap-3">
            <DarkModeToggle />

            <button className="p-2 rounded-full text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 active:scale-95">
              🔍
            </button>

            <NotificationBell />

            <button
              onClick={() => setShow(!show)}
              className={`
                relative p-2 rounded-full transition-all duration-300
                hover:bg-blue-50 hover:scale-110 active:scale-95
                ${show ? "bg-blue-50 ring-2 ring-blue-200" : ""}
              `}
            >
              👤
            </button>

            <div className={`
              absolute right-0 top-14 z-50
              origin-top-right transform transition-all duration-500 ease-out
              ${show
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}
            `}>
              <ProfileDropdown close={() => setShow(false)} />
            </div>
          </div>

          {/* Mobile — dark toggle + hamburger */}
          <div ref={menuRef} className="lg:hidden relative flex items-center gap-1">

            <DarkModeToggle className="w-9 h-9" />

            <button
              className={`
                relative p-2 rounded-lg text-gray-700 overflow-hidden
                transition-all duration-300 hover:bg-blue-50 active:scale-90
              `}
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle menu"
            >
              <span className={`inline-block transition-transform duration-300 ${mobileMenu ? "rotate-90 scale-110" : "rotate-0 scale-100"}`}>
                {mobileMenu ? "✕" : "☰"}
              </span>
            </button>

            {/* Mobile dropdown — slide + fade + scale entrance */}
            <div
              className={`
                absolute right-0 top-12 w-60 z-50
                bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100
                p-3 space-y-1 origin-top-right
                transition-all duration-300 ease-out
                ${mobileMenu
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
              `}
            >
              {[
                { to: "/",        label: "🏠 Home"       },
                { to: "/movies",  label: "🎬 Movies"     },
                { to: "/flights", label: "✈️ Flights"    },
                { to: "/hotels",  label: "🏨 Hotels"     },
                { to: "/events",  label: "🎉 Events"     },
                { to: "/wishlist",label: "❤️ Wishlist"   },
                { to: "/profile", label: "👤 Profile"    },
                { to: "/contact", label: "📨 Contact Us" },
              ].map(({ to, label }, i) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenu(false)}
                  style={{ transitionDelay: mobileMenu ? `${i * 30}ms` : "0ms" }}
                  className={`
                    block px-3 py-2 rounded-xl text-sm font-medium text-gray-700
                    transition-all duration-300 ease-out
                    hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1
                    ${mobileMenu ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
                  `}
                >
                  {label}
                </Link>
              ))}

              <div className="border-t border-gray-100 my-1" />

              {/* Dark mode row */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-300 hover:bg-blue-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm flex-shrink-0 transition-transform duration-300 hover:rotate-12">
                    {dark ? "🌙" : "☀️"}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {dark ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
                <DarkModeToggle className="flex-shrink-0 w-8 h-8" />
              </div>

              <div className="border-t border-gray-100 my-1" />

              {/* Logout */}
              <button
                onClick={() => { handleLogout(); setMobileMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-500 transition-all duration-300 hover:bg-red-50 hover:translate-x-1"
              >
                🚪 Logout
              </button>

            </div>
          </div>

        </nav>
      </div>
    </>
  );
}