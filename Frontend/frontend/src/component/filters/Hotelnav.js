 import { Link } from "react-router-dom";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../ProfileDrapdown";
import NotificationBell from "../bell";
 //import logo from "../../../assets/logo.svg";
 export default  function Hotelnav(){
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const [mobileMenu, setMobileMenu] = useState(false);
    return (
    <>
      <div className="pt-3 mt-3 px-2 sm:px-4">
        {/* Navbar */}
        <nav className="shadow-md px-4 sm:px-6 py-4 flex items-center justify-between border rounded-lg bg-white relative">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="160"
              height="50"
              viewBox="0 0 160 50"
              xmlns="http://www.w3.org/2000/svg"
              className="w-32 sm:w-40"
            >
              <g transform="translate(0,5)">
                <circle cx="25" cy="20" r="18" fill="#2563EB" />
                <path
                  d="M5 28 C18 5, 32 5, 45 20"
                  stroke="white"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <polygon
                  points="28,10 42,16 28,20 32,26 24,20 12,22"
                  fill="white"
                />
              </g>

              <text
                x="50"
                y="31"
                fontFamily="Poppins, Arial, sans-serif"
                fontSize="20"
                fontWeight="600"
                fill="#091fed"
              >
                SafarSetu
              </text>
            </svg>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex gap-8 text-gray-700 font-bold">
            <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
            <li><Link to="/movies" className="hover:text-blue-500">Movies</Link></li>
            <li><Link to="/flights" className="hover:text-blue-500">Flights</Link></li>
            <li><Link to="/hotels" className="hover:text-blue-500">Hotels</Link></li>
            <li><Link to="/events" className="hover:text-blue-500">Events</Link></li>
          </ul>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              🔍
            </button>

            <NotificationBell />

            {/* Profile */}
            <button
              onClick={() => setShow(!show)}
              className="hover:bg-gray-100 rounded-full p-2"
            >
              👤
            </button>

            <div
    className={`
      absolute
      right-0
      top-14
      z-50
      origin-top-right
      transform
      transition-all
      duration-500
      ease-out
      ${
        show
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-3 pointer-events-none"
      }
    `}
  >
    <ProfileDropdown close={() => setShow(false)} />
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenu && (
          <div className="lg:hidden bg-white shadow-lg rounded-lg mt-2 p-4 space-y-4 border">

            <Link to="/" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Home</Link>
            <Link to="/movies" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500 ">Movies</Link>
            <Link to="/flights" className="block hover:hover:shadow-lg p-2 rounded courser-pointerhover:text-blue-500">Flights</Link>
            <Link to="/hotels" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Hotels</Link>
            <Link to="/events" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Events</Link>
            <Link to="/wishlist" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Wishlist</Link>
            <Link to="/profile" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Profile</Link>
            <Link to="/contact" className="block hover:hover:shadow-lg p-2 rounded courser-pointer hover:text-blue-500">Contact Us</Link>

          </div>
        )}

        {/* Hero Text */}
        
      </div>
    </>
  );
  }