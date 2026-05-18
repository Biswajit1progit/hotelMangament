 export const getUser = () => {
  return JSON.parse(sessionStorage.getItem("user"));
};

export const getToken = () => {
  return sessionStorage.getItem("token");
};

export const setUserSession = (user, token) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("token", token);
};

export const logoutUser = () => {
  sessionStorage.clear();
};

export const isLoggedIn = () => {
  return !!getToken();
};
