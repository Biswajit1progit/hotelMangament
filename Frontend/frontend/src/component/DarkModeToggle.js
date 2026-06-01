// ─────────────────────────────────────────────────────────────
// src/component/DarkModeToggle.jsx
// Drop this anywhere — Navbar, Dashboard header, etc.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { toggleDarkMode, isDarkMode } from "../utils/darkMode";

export default function DarkModeToggle({ className = "" }) {
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(isDarkMode()); }, []);

  const handleToggle = () => {
    const next = toggleDarkMode();
    setDark(next);
  };

  return (
    <button
      onClick={handleToggle}
      title={dark ? "Light Mode" : "Dark Mode"}
      aria-label="Toggle dark mode"
      className={`relative inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 w-9 h-9 ${className}`}
    >
      <span
        className="absolute text-base transition-all duration-300"
        style={{
          opacity: dark ? 0 : 1,
          transform: dark ? "rotate(90deg) scale(0)" : "rotate(0deg) scale(1)",
        }}
      >
        ☀️
      </span>
      <span
        className="absolute text-base transition-all duration-300"
        style={{
          opacity: dark ? 1 : 0,
          transform: dark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)",
        }}
      >
        🌙
      </span>
    </button>
  );
}