import "./styles/dark.css";          // ← add this
import { initDarkMode } from "./utils/darkMode";
initDarkMode();   
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);