import api, { setAccessToken, clearAccessToken, getAccessToken } from "../services/apiClient";

// ── User object stays in sessionStorage (non-sensitive, needed for sync reads)
// Access token stays in memory only (apiClient.js)
// "token" key is GONE from sessionStorage — nothing writes it anymore

export const getUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// Kept for any component that calls getToken() directly
// Returns from memory — same value the interceptor uses
export const getToken = () => getAccessToken();

// isLoggedIn now checks user object (not token) since token is in memory
// and may not be set yet during initAuth(). User in sessionStorage is the
// reliable sync indicator.
export const isLoggedIn = () => !!getUser();

// ── setUserSession — kept for backward compatibility with authService.js
// Only writes user to sessionStorage. Token is handled by setAccessToken().
export const setUserSession = (user, token) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  setAccessToken(token);
  // NOTE: deliberately NOT writing token to sessionStorage anymore
};

// ── logoutUser — NOW ASYNC
// Calls backend to kill refresh token in DB + clear httpOnly cookie,
// then wipes frontend state.
// Usage in Navbar/Hotelnav/ProfileDropdown:
//   const handleLogout = async () => { await logoutUser(); navigate("/", { replace: true }); }
export const logoutUser = async () => {
  try {
    await api.post("/api/auth/logout");
  } catch { /* clear frontend even if request fails */ }
  finally {
    clearAccessToken();
    sessionStorage.clear();
  }
};

// ── initAuth — call ONCE in App.jsx on mount
// Silently gets a new access token from the refresh cookie if valid.
// This restores sessions across page refreshes without localStorage.
export const initAuth = async () => {
  try {
    const { data } = await api.post("/api/auth/refresh");
    setAccessToken(data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } catch {
    clearAccessToken();
    sessionStorage.removeItem("user");
    return null;
  }
};