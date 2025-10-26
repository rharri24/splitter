// import React, { useState } from 'react';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     // Handle login logic here (e.g., API call)
//     console.log('Logging in with:', username, password);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label htmlFor="username">Username:</label>
//         <input
//           type="text"
//           id="username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//       </div>
//       <div>
//         <label htmlFor="password">Password:</label>
//         <input
//           type="password"
//           id="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>
//       <button type="submit">Login</button>
//     </form>
//   );
// }

// export default Login;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for messages in URL parameters
    const params = new URLSearchParams(location.search);
    const urlMessage = params.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // ✅ Store UID in localStorage to persist across page reloads
        localStorage.setItem("currentUserUID", data.uid);
  
        alert("✅ Login successful!");
  
        // ✅ Redirect WITHOUT needing UID in the URL
        navigate(`/destination`);
      } else {
        setMessage(`❌ ${data.error || 'Invalid email or password'}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ An error occurred during login. Please try again.");
    }
  };
  
  return (
    <div style={formStyle}>
      <h2>Student Login</h2>
      {message && <div style={messageStyle}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>Login</button>
        <p style={linkStyle}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}

const formStyle = {
  textAlign: "center",
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
  backgroundColor: "#4285F4",
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

const messageStyle = {
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "4px",
  backgroundColor: "#f8f9fa",
  borderLeft: "4px solid #4285F4",
};

export default Login;