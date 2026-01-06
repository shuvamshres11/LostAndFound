import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import emailjs from "@emailjs/browser";
import {
  setFullName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setOtp,
} from "./redux/signupSlice";
import "./signup.css";
import logo from "./assets/lnf_logo.png";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, email, fullName } = useSelector((state) => state.signup);
  const [showPassword, setShowPassword] = useState(false); // Visibility state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Visibility state

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error || !email || !fullName) return;

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in Redux so VerifyOtp.jsx can access it
    dispatch(setOtp(generatedOtp));

    // MATCHING YOUR SCREENSHOT:
    // Your template uses {{email}} and {{passcode}}
    const templateParams = {
      email: email,      // Matches {{email}} in your screenshot
      passcode: generatedOtp, // Matches {{passcode}} in your screenshot
    };

    emailjs
      .send(
        "service_j2a41on",
        "template_vgh42wo",
        templateParams,
        "P1xY_U1usE_RY1UA4"
      )
      .then((result) => {
        console.log("Email sent successfully!", result.text);
        navigate("/verify-otp");
      })
      .catch((err) => {
        console.error("Failed to send email:", err);
        alert("Check your console. EmailJS is reporting an error.");
      });
  };

  return (
    <div className="signup-container">
      <div className="left-side">
        <h2 className="form-title">Sign up</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Full Name"
              required
              onChange={(e) => dispatch(setFullName(e.target.value))}
            />
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => dispatch(setEmail(e.target.value))}
            />
          </div>
          <div className="input-box">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                required
                onChange={(e) => dispatch(setPassword(e.target.value))}
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
          <div className="input-box">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                onChange={(e) => dispatch(setConfirmPassword(e.target.value))}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ display: "flex", alignItems: "center" }}
              >
                {showConfirmPassword ? (
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
          {error && <p className="error-text">{error}</p>}
          <button className="btn" disabled={!!error} type="submit">
            Sign up
          </button>
        </form>
        <p className="switch-text">
          Already have an account?{" "}
          <Link to="/login" className="switch-link">Log in</Link>
        </p>
      </div>
      <div className="divider"></div>
      <div className="right-side">
        <img src={logo} alt="Logo" className="logo-img" />
        <h1 className="app-title">LOST & FOUND <br /><span>TRACKER</span></h1>
      </div>
    </div>
  );
}