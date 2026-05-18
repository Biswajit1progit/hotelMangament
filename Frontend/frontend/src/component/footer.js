

import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaGithub
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-3">Hotel Booking</h3>
          <p className="text-gray-400 leading-relaxed">
            Book hotels easily with secure payments and instant confirmation.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white transition">
                My Profile
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact + Social */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Contact</h3>
          <p className="text-gray-400">Email: support@hotelbooking.com</p>
          <p className="text-gray-400 mb-4">Phone: +91 9876543210</p>

          <div className="flex gap-4 mt-3">
           <a
          href="https://github.com/Biswajit1progit"
          target="_blank"
           rel="noopener noreferrer"
          className="bg-gray-800 p-3 rounded-full hover:bg-gray-600 transition"
          >
             <FaGithub />
           </a>
            <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition">
              <FaFacebookF />
            </a>

            <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition">
              <FaInstagram />
            </a>

            <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-sky-500 transition">
              <FaTwitter />
            </a>

            <a href="https://www.linkedin.com/in/biswajit-sahoo-226975291/" className="bg-gray-800 p-3 rounded-full hover:bg-blue-700 transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3">Newsletter</h3>
          <p className="text-gray-400 mb-4">
            Subscribe to get latest hotel offers and updates.
          </p>

          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg text-white border border-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 px-5 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-4 border-t border-gray-700 text-gray-500 text-sm">
        © 2026 Hotel Booking System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;