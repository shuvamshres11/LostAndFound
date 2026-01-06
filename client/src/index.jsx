import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate(); // <-- for redirect

  const handleLogin = () => {
    // You can add validation later
    navigate("/home"); // redirect to homepage
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="left-section">
        <img src="/logo.png" alt="Lost & Found Logo" className="logo-img" />

        <h1 className="title">
          LOST & FOUND <br />
          <span>TRACKER</span>
        </h1>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Right Section */}
      <div className="right-section">
        <h2 className="login-title">Login</h2>

        <input type="email" placeholder="Email" className="input-box" />
        <input type="password" placeholder="Password" className="input-box" />

        <p className="forgot">Forgot Password?</p>

        <button className="login-btn" onClick={handleLogin}>
          Log in
        </button>

        <p className="signup-text">
          Don’t have an account?{" "}
          <span className="signup-link">Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
