import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./login.css"; // Reuse login styles
import logo from "./assets/lnf_logo.png";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Check if email exists in backend
            const response = await fetch("http://localhost:5000/api/auth/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                alert("Email not found. Please check and try again.");
                setLoading(false);
                return;
            }

            // 2. Generate OTP
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

            // 3. Send OTP via EmailJS
            const templateParams = {
                email: email,
                passcode: generatedOtp,
            };

            await emailjs.send(
                "service_j2a41on",
                "template_vgh42wo",
                templateParams,
                "P1xY_U1usE_RY1UA4"
            );

            // 4. Navigate to Verify OTP page
            navigate("/verify-reset-otp", { state: { email, otp: generatedOtp } });

        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="left-side">
                <h2 className="form-title">Forgot Password</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>Enter your email to receive a reset code.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>
                <p className="switch-text">
                    Remembered?{" "}
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
