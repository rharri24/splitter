import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterStudent = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (password !== confirmPassword) {
      alert("1 Passwords do not match!");
      return;
    }
    
    if (password.length < 6) {
      alert("2 Password must be at least 6 characters long!");
      return;
    }
    
    const studentData = { name, email, phoneNumber, uid, password };

    try {
      const response = await fetch("http://localhost:5000/api/register-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      const result = await response.json(); // Parse JSON response

      if (response.ok) {
        alert("✅ Student registered successfully!");
        navigate(`/destination?email=${email}`); // Redirect to destination entry if successful
        window.location.reload();
      } else if (response.status === 409) { // Check for conflict (student already exists)
        alert("User with this email already exists. Redirecting to login...");
        navigate(`/login?message=${encodeURIComponent("User already exists. Please log in.")}`);
      } else {
        alert(`3 Error registering student: ${result.error}`);
      }
    } catch (error) {
      console.error("4 Error:", error);
      alert("⚠ Registration failed. Check console for details.");
    }
  };

  return (
    <div style={formStyle}>
      <h2>Register Student</h2>
      <form onSubmit={handleRegisterStudent}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          type="text" 
          placeholder="Phone Number" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          type="text" 
          placeholder="UID" 
          value={uid} 
          onChange={(e) => setUid(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={inputStyle}
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Register Student</button>
        <p style={linkStyle}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

const formStyle = {
  textAlign: "center",
  marginTop: "50px",
  maxWidth: "400px",
  margin: "50px auto",
  padding: "20px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  borderRadius: "8px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const buttonStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  width: "100%",
};

const linkStyle = {
  marginTop: "15px",
  fontSize: "14px",
};

export default RegisterStudent;