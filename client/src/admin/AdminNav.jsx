import "../components/nav.css";
import logo from "../assets/lnf_logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const AdminNav = () => {
    const [open, setOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const closeDropdown = () => setOpen(false);

    // Logout Logic
    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <>
            <nav className="navbar">
                {/* Left: Logo */}
                <div className="nav-logo">
                    <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
                        <img src={logo} alt="Lost & Found" className="nav-logo-img" />
                        <div className="logo-text">
                            <span className="logo-title">LOST & FOUND</span>
                            <span className="logo-sub"> &nbsp;ADMIN</span>
                        </div>
                    </Link>
                </div>

                {/* Center: Menu */}
                <ul className="nav-links">
                    <li><Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>Dashboard</Link></li>
                    <li><Link to="/admin/all-posts" className={location.pathname === "/admin/all-posts" ? "active" : ""}>All Posts</Link></li>
                    <li><Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>Manage Users</Link></li>
                    <li><Link to="/admin/posts" className={location.pathname === "/admin/posts" ? "active" : ""}>Manage Posts</Link></li>
                </ul>

                {/* Right: Profile */}
                <div className="nav-actions">
                    <div className="nav-profile" ref={dropdownRef}>
                        <button className="profile-btn" onClick={() => setOpen(!open)}>
                            {currentUser?.firstName || "Admin"}
                        </button>

                        {open && (
                            <div className="profile-dropdown">
                                <button
                                    className="logout-btn"
                                    onClick={() => { setShowLogoutConfirm(true); closeDropdown(); }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Message Box */}
            {showLogoutConfirm && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal-content">
                        <h3>Are you sure?</h3>
                        <p>Do you really want to log out of admin panel?</p>
                        <div className="logout-modal-actions">
                            <button className="confirm-btn" onClick={handleConfirmLogout}>Logout</button>
                            <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNav;
