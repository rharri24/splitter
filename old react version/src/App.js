import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import RegisterStudent from "./pages/RegisterStudent.js";
import Destination from "./pages/Destination.js";

const App = () => {
  return (
    <Router>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Welcome to Student Ride Sharing</h1>
        <p>Find and share rides with other students.</p>

        {/* Navigation Buttons */}
        <Link to="/login">
          <button style={buttonStyle}>Login</button>
        </Link>
        <Link to="/register">
          <button style={buttonStyle}>Register</button>
        </Link>
        <Link to="/register-student">
          <button style={buttonStyle}>Register Student</button>
        </Link>

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/destination" element={<Destination />} />
        </Routes>
      </div>
    </Router>
  );
};

// Simple button styling
const buttonStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
};

export default App;
