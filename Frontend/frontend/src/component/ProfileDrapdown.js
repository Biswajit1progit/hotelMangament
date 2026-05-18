 import { useNavigate } from "react-router-dom";
import { getUser, logoutUser, isLoggedIn } from "../utils/auth";
import { useEffect,useRef  }  from "react";
const ProfileDropdown = ({ close } ) => {
  const ref = useRef();   
  const user = getUser();
  const navigate = useNavigate();
 // ✅ CLOSE WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        close(); // close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleLogout = () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    logoutUser();
    navigate("/login");
  };
  return (
   
    <div
      ref={ref}
      className="absolute right-4 top-14 bg-white shadow-lg rounded-lg p-4 w-60 z-50 border border-gray-300 cursor-pointer hover:transition-transform duration-300 "
    >
      {user ? (
        <>
          <div className="item-center ml-6">
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
        display="flex"
      >
      SafarSetu
      </text>
           </svg>
          </div>
        
         <div className="item-center flex gap-2 ">
                 <div className="  border-1 rounded-full p-1 bg-gray-100">
                 <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  className="w-6 h-6"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1"
    d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
  />
                 </svg>
                 </div>
                 <div className="  w-full mb-1  ">
                   <p className="font-semibold">{user.name}</p>
                  
                 </div>
          </div>
               
              

          
          
          
          <hr className="my-2" />

          <button onClick={() => navigate("/profile")} className="block w-full text-left hover:shadow-md p-2 rounded courser-pointer ">
            👤 Profile
          </button>

          <button onClick={() => navigate("/bookings")} className="block w-full text-left mt-2 hover:shadow-md p-2 rounded courser-pointer ">
            📅 My Bookings
          </button>
          <button onClick={() => navigate("/wishlist")} className="block w-full text-left mt-2 hover:shadow-md p-2 rounded courser-pointer ">
            ❤️ Wishlist
          </button>

          <button onClick={handleLogout} className="text-red-500 font-bold mt-2 ml-12  hover:shadow-md p-2 rounded-lg courser-pointer">
             <svg
  xmlns="http://www.w3.org/2000/svg"
  width="100"
  height="25"
  viewBox="0 0 120 40"
  fill="none"
>
  {/* Logout Icon */}
  <path
    d="M20 10L28 20L20 30"
    stroke="blue"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M28 20H10"
    stroke="blue"
    strokeWidth="2"
    strokeLinecap="round"
  />
  <path
    d="M10 8H6C4.9 8 4 8.9 4 10V30C4 31.1 4.9 32 6 32H10"
    stroke="blue"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  {/* Text */}
  <text
    x="40"
    y="25"
    fontSize="16"
    fontFamily="Arial, sans-serif"
    fill="blue"
    fontWeight="600"
  >
    Logout
  </text>
            </svg>   
          </button>
          
        </>
      ) : (
        <>
          <p className="text-sm mb-2">Not logged in</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Login
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;