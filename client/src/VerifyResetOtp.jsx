import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VerifyOtp.css"; // Reuse VerifyOtp styles
import logo from "./assets/lnf_logo.png";

export default function VerifyResetOtp() {
    const [userOtp, setUserOtp] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {}; // Get state passed from ForgotPassword

    useEffect(() => {
        if (!email || !otp) {
            alert("Invalid access. Please restart the process.");
            navigate("/forgot-password");
        }
    }, [email, otp, navigate]);

    const verifyOtp = () => {
        if (userOtp.trim() === otp) {
            // OTP Matches
            navigate("/reset-password", { state: { email } });
        } else {
            alert("Invalid OTP. Please check your email and try again.");
        }
    };

    return (
        <div className="verify-container">
            <div className="verify-left">
                <h2 className="verify-title">Verify OTP</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>Enter the code sent to {email}</p>
                <input
                    className="verify-input"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value)}
                />
                <button className="verify-btn" onClick={verifyOtp}>
                    Verify Code
                </button>
                <p style={{ marginTop: "15px", textAlign: "center" }}>
                    <Link to="/forgot-password" style={{ color: "#5c7cbe", textDecoration: "none" }}>Resend Code</Link>
                </p>
            </div>
            <div className="verify-divider"></div>
            <div className="verify-right">
                <img src={logo} alt="Logo" className="verify-logo" />
                <h1 className="verify-app-title">LOST & FOUND <br /><span>TRACKER</span></h1>
            </div>
        </div>
    );
}
