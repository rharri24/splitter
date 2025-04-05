import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";  // Import the main App component
import "./style.css";  // Import global CSS

// Inject React into the "root" div in index.html
ReactDOM.createRoot(document.getElementById("root")).render(<App />);