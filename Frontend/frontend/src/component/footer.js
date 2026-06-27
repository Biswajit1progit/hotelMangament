import { useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../utils/auth";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

// X (formerly Twitter) icon — react-icons doesn't have FaXTwitter in older versions
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    href: "https://github.com/Biswajit1progit",
    icon: <FaGithub className="w-3.5 h-3.5" />,
    label: "GitHub",
    hover: "hover:bg-white/20 hover:text-white",
  },
  {
    href: "#",
    icon: <FaFacebookF className="w-3.5 h-3.5" />,
    label: "Facebook",
    hover: "hover:bg-blue-600 hover:border-blue-600 hover:text-white",
  },
  {
    href: "#",
    icon: <FaInstagram className="w-3.5 h-3.5" />,
    label: "Instagram",
    hover: "hover:bg-pink-600 hover:border-pink-600 hover:text-white",
  },
  {
    href: "#",
    icon: <XIcon />,
    label: "X",
    hover: "hover:bg-white hover:border-white hover:text-gray-900",
  },
  {
    href: "https://www.linkedin.com/in/biswajit-sahoo-226975291/",
    icon: <FaLinkedinIn className="w-3.5 h-3.5" />,
    label: "LinkedIn",
    hover: "hover:bg-blue-700 hover:border-blue-700 hover:text-white",
  },
];

export default function Footer() {
  const user = getUser();
  const [email, setEmail]   = useState("");
  const [subbed, setSubbed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    // TODO: wire to your newsletter API
    setSubbed(true);
    setEmail("");
  };

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden mt-10">

      {/* ── Subtle top gradient accent ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />

      {/* ── Main grid ── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-8
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* ── Brand ── */}
        <div className="sm:col-span-2 lg:col-span-1">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <svg width="130" height="40" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path d="M5 28 C18 5, 32 5, 45 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <polygon points="28,10 42,16 28,20 32,26 24,20 12,22" fill="white" />
              </g>
              <text x="50" y="31" fontFamily="Poppins, Arial, sans-serif" fontSize="20" fontWeight="600" fill="#60a5fa">
                SafarSetu
              </text>
            </svg>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Book hotels effortlessly across India — with secure payments,
            instant confirmation, and 24-hour support.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2 flex-wrap">
            {SOCIAL_LINKS.map(({ href, icon, label, hover }) => (
              <a
                key={label}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  border border-white/10 text-gray-400
                  transition-all duration-300 ${hover}
                `}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/",        label: "Home"      },
              { to: "/hotels",  label: "Hotels"    },
              { to: "/movies",  label: "Movies"    },
              { to: "/flights", label: "Flights"   },
              { to: "/events",  label: "Events"    },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500/60 group-hover:bg-blue-400 transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Account Links (auth-aware) ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">
            Account
          </h3>
          <ul className="space-y-2.5 text-sm">
            {user ? (
              <>
                {[
                  { to: "/profile",  label: "My Profile"  },
                  { to: "/bookings", label: "My Bookings" },
                  { to: "/wishlist", label: "Wishlist"    },
                  { to: "/contact",  label: "Contact Us"  },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="inline-block w-1 h-1 rounded-full bg-violet-500/60 group-hover:bg-violet-400 transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-violet-500/60 group-hover:bg-violet-400 transition-colors" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-violet-500/60 group-hover:bg-violet-400 transition-colors" />
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Contact info */}
          <div className="mt-6 space-y-1.5 text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <span className="text-blue-400">✉</span>
              <a href="mailto:2301104066cse@gcekjr.ac.in" className="hover:text-gray-300 transition-colors break-all">
                2301104066cse@gcekjr.ac.in
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-400">📞</span>
              <a href="tel:+919861734116" className="hover:text-gray-300 transition-colors">
                +91 98617 34116
              </a>
            </p>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-4">
            Newsletter
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Get the latest hotel deals and travel offers delivered to your inbox.
          </p>

          {subbed ? (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
              <span>✓</span>
              <span>You're subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-white/5 border border-white/10 text-white
                  placeholder:text-gray-600
                  focus:outline-none focus:border-blue-500/50
                  focus:bg-white/8 transition-all duration-300
                "
              />
              <button
                type="submit"
                className="
                  w-full py-2.5 rounded-xl text-sm font-semibold
                  bg-gradient-to-r from-blue-600 to-violet-600
                  hover:from-blue-500 hover:to-violet-500
                  shadow-[0_2px_12px_rgba(59,130,246,0.3)]
                  hover:shadow-[0_4px_20px_rgba(59,130,246,0.45)]
                  transition-all duration-300 active:scale-[0.98]
                "
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4
                        flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} SafarSetu. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with
            <span className="text-red-500 mx-0.5">♥</span>
            by
            <a
              href="https://github.com/Biswajit1progit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 ml-1 transition-colors"
            >
              Biswajit
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}