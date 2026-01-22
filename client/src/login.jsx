import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "./components/ToastContext";
import "./login.css";
import logo from "./assets/lnf_logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 1. Create state variables to hold the user's input
  // 1. Create state variables to hold the user's input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // 2. Function to handle the login request to the backend
  const handleLogin = async (e) => {
    e?.preventDefault(); // Prevent default from submission
    // Basic frontend check before sending to server
    if (!email || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    try {
      // Send data to your Express backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Store user data and redirect
        localStorage.setItem("user", JSON.stringify(data.user));
        showToast("Welcome back!", "success");
        navigate("/home");
      } else {
        // Failure: Show the specific error message from the backend 
        // (e.g., "Account not found" or "Invalid password")
        showToast(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast(`Connection failed: ${error.message}. Check if server is running on port 5000.`, "error");
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      {/* Left Side */}
      <div className="left-side">
        <img src={logo} alt="Lost & Found Logo" className="logo-img" />
        <h1 className="app-title">
          LOST & FOUND
          <span>TRACKER</span>
        </h1>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Right Side */}
      <form className="right-side" onSubmit={handleLogin}>
        <h2 className="form-title">Login</h2>

        <div className="input-box">
          {/* 3. Bind the input value to the 'email' state */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-box">
          {/* 4. Bind the input value to the 'password' state */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={{ display: "flex", alignItems: "center" }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="forgot">
          <Link to="/forgot-password" style={{ color: "inherit", textDecoration: "none" }}>Forgot Password?</Link>
        </p>

        <button className="btn" type="submit">
          Log in
        </button>

        <p className="switch-text">
          Don’t have an account?{" "}
          <span className="switch-link" onClick={handleSignupRedirect}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;