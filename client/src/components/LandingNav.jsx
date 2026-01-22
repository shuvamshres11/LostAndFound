import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ToastContext";
import "./LandingNav.css";
import logo from "../assets/lnf_logo.png";

const LandingNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Helper to determine if we should show active state (optional)
    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="landing-navbar">
            {/* Left: Logo */}
            <div className="landing-nav-logo">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
                        <img src={logo} alt="Lost & Found" className="landing-logo-img" />
                        <div className="landing-logo-text">
                            <span className="landing-logo-title">LOST & FOUND</span>
                            <span className="landing-logo-sub">TRACKER</span>
                        </div>
                    </Link>
                </Link>
            </div>

            {/* Center: Menu Links */}
            <ul className="landing-nav-links">
                <li><Link to="/" className={isActive("/")}>Home</Link></li>
                <li><Link to="/lost-items" className={isActive("/lost-items")}>Lost Items</Link></li>
                <li><Link to="/found-items" className={isActive("/found-items")}>Found Items</Link></li>
                <li>
                    <Link
                        to="/post-item"
                        className={isActive("/post-item")}
                        onClick={(e) => {
                            e.preventDefault();
                            showToast("Please login to post an item.", "error");
                        }}
                    >
                        Post an Item
                    </Link>
                </li>
                <li><Link to="/about" className={isActive("/about")}>About</Link></li>
                <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>
            </ul>

            {/* Right: Login / Signup */}
            <div className="landing-nav-actions">
                <Link to="/login" className="landing-btn-login">
                    Log In
                </Link>
                <Link to="/signup" className="landing-btn-signup">
                    Sign Up
                </Link>
            </div>
        </nav>
    );
};

export default LandingNav;
