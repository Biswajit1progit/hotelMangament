import { Link } from "react-router-dom";
/* import logo from "../../assets/logo.svg";     */
/* import logo from "../asset/logo.svg"; */
/* import  login from "../pages/Login";
import Register from "../pages/Register"; */
import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import { useState,useEffect,useRef } from "react";
import ProfileDropdown from "./ProfileDrapdown";
import NotificationBell from "./bell";

export default  function Navbar(){
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
     const [mobileMenu, setMobileMenu] = useState(false);
     const [scrolled, setScrolled] = useState(false);
     const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMobileMenu(false);
    }
  };
  if (mobileMenu) {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);  // ← touch support
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("touchstart", handleClickOutside);
  };
}, [mobileMenu]);
      // 👇 Detect scroll
     useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
      }, []);
     const user = getUser();
    const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };
   return (
    <>
      <div className="pt-3 mt-3 px-2 sm:px-4">
        {/* Navbar */}
        <nav className={`
            px-4 sm:px-6 py-4
            flex items-center justify-between
            border rounded-lg
            sticky top-2 z-50
            transition-all duration-300

            ${
              scrolled
                ? "bg-white/90 backdrop-blur-md shadow-lg"
                : "bg-white-100"
            }
          `}>

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
            <li><Link to="/contact" className="hover:text-blue-500">Contact Us</Link></li>
          </ul>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              🔍
            </button>

            {/* Notification */}
            {/* <button className="p-2 hover:bg-gray-100 rounded-full">
              🔔
            </button> */}
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
          
            <div ref={menuRef} className="lg:hidden relative">
    <button
      className="p-2"
      onClick={() => setMobileMenu(!mobileMenu)}
    >
      ☰
    </button>

    {mobileMenu && (
      <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-4 space-y-3 border w-56 z-50">
        <Link to="/" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Home</Link>
        <Link to="/movies" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Movies</Link>
        <Link to="/flights" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Flights</Link>
        <Link to="/hotels" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Hotels</Link>
        <Link to="/events" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Events</Link>
        <Link to="/wishlist" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Wishlist</Link>
        <Link to="/profile" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Profile</Link>
        <Link to="/contact" onClick={() => setMobileMenu(false)} className="block p-2 rounded hover:text-blue-500">Contact Us</Link>
      </div>
    )}
  </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {/* {mobileMenu && (
          <div className="lg:hidden bg-white shadow-lg rounded-lg mt-2 p-4 space-y-4 border">

            <Link to="/" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Home</Link>
            <Link to="/movies" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500 ">Movies</Link>
            <Link to="/flights" className="block hover:hover:shadow-md p-2 rounded courser-pointerhover:text-blue-500">Flights</Link>
            <Link to="/hotels" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Hotels</Link>
            <Link to="/events" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Events</Link>
            <Link to="/wishlist" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Wishlist</Link>
            <Link to="/profile" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Profile</Link>
            <Link to="/contact" className="block hover:hover:shadow-md p-2 rounded courser-pointer hover:text-blue-500">Contact Us</Link>

          </div>
        )} */}

        {/* Hero Text */}
        
      </div>
    </>
  );
 }