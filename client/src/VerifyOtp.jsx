import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./VerifyOtp.css";
import logo from "./assets/lnf_logo.png";

export default function VerifyOtp() {
  const [userOtp, setUserOtp] = useState("");
  // We pull email and password from Redux to send to the backend later
  const { otp, email, password, fullName } = useSelector((state) => state.signup);
  const navigate = useNavigate();

  // Redirect if someone tries to access this page without generating an OTP
  useEffect(() => {
    if (!otp) {
      navigate("/signup");
    }
  }, [otp, navigate]);

  const verifyOtp = async () => {
    // 1. Check if the entered OTP matches the one sent to email
    if (userOtp.trim() === otp) {
      try {
        // Split full name into first and last name
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        // 2. If OTP is correct, send the registration data to the Express backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        // 3. Parse the JSON response to get specific messages like "User already exists"
        const data = await response.json();

        if (response.ok) {
          // Auto-login: save token + user to localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          alert("Account created successfully!");
          navigate("/home");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Connection error:", error);
        alert("Server is not running. Please start your backend.");
      }
    } else {
      alert("Invalid OTP. Please check your email and try again.");
    }
  };

  return (
    <div className="verify-container">
      <form className="verify-left" onSubmit={(e) => { e.preventDefault(); verifyOtp(); }}>
        <h2 className="verify-title">Verify OTP</h2>
        <input
          className="verify-input"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={userOtp}
          onChange={(e) => setUserOtp(e.target.value)}
          required
        />
        <button className="verify-btn" type="submit">
          Verify
        </button>
      </form>
      <div className="verify-divider"></div>
      <div className="verify-right">
        <img src={logo} alt="Logo" className="verify-logo" />
        <h1 className="verify-app-title">LOST & FOUND <br /><span>TRACKER</span></h1>
      </div>
    </div>
  );
}