// ─────────────────────────────────────────────────────────────
// src/utils/darkMode.js
// Dark mode utility — no tailwind.config changes needed
// Uses CSS variables + data-theme attribute on <html>
// ─────────────────────────────────────────────────────────────

export const DARK_KEY = "safarsetu_dark_mode";

// Call once on app start (in index.js or App.js)
export function initDarkMode() {
  const saved = localStorage.getItem(DARK_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved !== null ? saved === "true" : prefersDark;
  applyDark(isDark);
}

export function applyDark(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.setAttribute("data-theme", "dark");
    root.classList.add("dark-mode");
  } else {
    root.removeAttribute("data-theme");
    root.classList.remove("dark-mode");
  }
  localStorage.setItem(DARK_KEY, isDark);
}

export function toggleDarkMode() {
  const current = localStorage.getItem(DARK_KEY) === "true";
  applyDark(!current);
  return !current;
}

export function isDarkMode() {
  return localStorage.getItem(DARK_KEY) === "true";
}