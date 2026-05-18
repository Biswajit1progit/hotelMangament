 import { useState,useEffect } from "react";
 import { loginUser } from "../services/authService";
 import {useLocation,  useNavigate } from "react-router-dom";
 
 function Login() {
   const [form, setForm] = useState({ email: "", password: "" });
   const navigate = useNavigate();
   const location = useLocation();
 
    useEffect(() => {
     const token = sessionStorage.getItem("token");
 
     if (token) {
       navigate("/"); // or previous page
     }
   }, []);
 
   /* const handleSubmit = async () => {
      await loginUser(form);
 
     sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
 
     alert("Login Success");
     /* navigate("/"); */
     /* const redirectTo = location.state?.from || "/";
   navigate(redirectTo);
   }; */
   const handleSubmit = async () => {
   try {
     await loginUser(form); // already stores session
 
     alert("Login Success");
 
     const redirectTo = location.state?.from || "/";
     navigate(redirectTo);
 
   } catch (err) {
     alert("Login failed");
   }
 };
 
   return (
     <>
     <div className="h-screen flex items-center justify-center bg-gray-100">
     <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
      <div className="item-center ml-24">
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
       
       </text>
        </svg>  
      </div>
       <div className="mt-2 ml-6 font-serif w-full">
         <p className="text-xl text-graw-400 w-[100%]">Welcome To SafarSetu</p>
        </div>
       <h2 className="text-2xl font-semibold mb-4 text-center px-3">Login</h2>
       <span className="text-xl color-gray-400">Email:</span>
       <input placeholder="Email"
         onChange={(e)=>setForm({...form, email:e.target.value})}
         className="border p-2 w-full mb-2 rounded-lg"/>
        <span className="text-xl color-gray-400">Password:</span>
       <input type="password" placeholder="Password"
         onChange={(e)=>setForm({...form, password:e.target.value})}
         className="border p-2 w-full mb-2 rounded-lg"/>
 
       <button onClick={handleSubmit}
         className=" w-full bg-blue-600 text-white px-4 py-2 rounded-lg">
         Login
       </button>
 
       <p className="text-sm mt-4 text-center">
       New user?{" "}
       <span
         className="text-blue-600 cursor-pointer"
         onClick={() => navigate("/register")}
       >
         Register
       </span>
     </p>
     </div>
     </div>
     </>
     
   );
 }
 
 export default Login;