import { Link } from "react-router-dom";
/* import logo from "../../assets/logo.svg";     */
/* import logo from "../asset/logo.svg"; */
/* import  login from "../pages/Login";
import Register from "../pages/Register"; */
import { useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../utils/auth";
import { useState } from "react";
import ProfileDropdown from "./ProfileDrapdown";
import { Link, useNavigate } from "react-router-dom";
export default  function Navbar(){
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
     const [mobileMenu, setMobileMenu] = useState(false);
      const user = getUser();
    const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };
    return(
        <>
        
        <div className="pt-3 mt-3">
           <nav className="ml-2 mr-2  shadow-md px-6 py-4 flex items-center justify-between border-1 rounded-lg ">

      {/* Logo */}
      <div className="flex items-center gap-2 ">
        {/* <img src={logo} alt="Logo" className="h-10 w-10" /> */}
      <svg
      width="160"
      height="50"
      viewBox="0 0 160 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Icon */}
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

      {/* Text */}
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
        {/* <span className="text-2xl font-bold text-blue-500">SafarSetu</span> */}
      </div>

      {/* Navigation Links */}
      <ul className="flex gap-8 text-gray-700 font-bold">
        <li>
          <Link to="/" className="hover:text-blue-500">Home</Link>
        </li>

        <li>
          <Link to="/movies" className="hover:text-blue-500">Movies</Link>
        </li>

        <li>
          <Link to="/flights" className="hover:text-blue-500">Flights</Link>
        </li>

        <li>
          <Link to="/hotels" className="hover:text-blue-500">Hotels</Link>
        </li>

        <li>
          <Link to="/events" className="hover:text-blue-500">Events</Link>
        </li>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Search Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Notification Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.17V11a6 6 0 10-12 0v3.17c0 .53-.21 1.04-.6 1.43L4 17h5m6 0a3 3 0 11-6 0"
            />
          </svg>
        </button>

        {/* Profile Icon */}
        {/* <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A9 9 0 1118.364 4.56 9 9 0 015.121 17.804z"
            />
          </svg>
        </button> */}

        {/* new addition of button */}

      {/* {user && (
          <>
            <button onClick={() => navigate("/profile")}>
              👤 Profile
            </button>

            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </>
        )} */}


        <button onClick={() => setShow(!show)} className="hover:bg-gray-100 rounded-full p-2">
          👤
         </button>
        <div className={`mb-10  transition-all duration-500 ease-in-out ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}

        >  
           {show && <ProfileDropdown close={() => setShow(false)} />}

        </div>
       
        {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => navigate("/register")}>
          Register
        </button>
         <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => navigate("/login")}>
          Login
        </button> */}

      </div>

        </nav>

        <div className="text-center text-yellow-50 mt-10 text-[40px] font-bold ">Book Your Next Adventure</div>


        </div>
        
        </>
    );
 }