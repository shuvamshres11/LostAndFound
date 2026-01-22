import "./nav.css";
import logo from "../assets/lnf_logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import socket from "../socket";

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false); // State for Notifications
  const [notificationCount, setNotificationCount] = useState(0); // Notification Count (Default 0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State for Logout UI
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Join User Room & Listen for Messages
  useEffect(() => {
    if (currentUser) {
      socket.emit("join_room", currentUser.id || currentUser._id);

      const handleReceiveMessage = (message) => {
        // If on chat page, we might not want to increment (or let Chat handle it)
        // But simple logic: increment badge.
        // If we are on chat page and chatting with that user, maybe don't increment?
        // For now, simple approach: always increment.
        if (location.pathname !== '/chat') { // Basic check
          setNotificationCount(prev => prev + 1);
        }
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [currentUser, location.pathname]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDropdown = () => setOpen(false);

  // Logout Logic
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("user"); // Clear user
    navigate("/"); // Redirect to landing page
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    if (notificationCount > 0) {
      // If we click, we can either clear count or just show dropdown. 
      // User asked "direct to the inbox when clicked".
      // So if we click the ICON, we should probably toggle dropdown? 
      // Or just go straight to chat?
      // "whenever we get messege from someone it has to show in the notification (nav) and direct to the inbox when clicked"
      // Let's make the notification ITEM clickable to go to chat.
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Left: Logo */}
        <div className="nav-logo">
          <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
              <img src={logo} alt="Lost & Found" className="nav-logo-img" />
              <div className="logo-text">
                <span className="logo-title">LOST & FOUND</span>
                <span className="logo-sub">TRACKER</span>
              </div>
            </Link>
          </Link>
        </div>

        {/* Center: Menu */}
        <ul className="nav-links">
          <li><Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link></li>
          <li><Link to="/lost-items" className={location.pathname === "/lost-items" ? "active" : ""}>Lost Items</Link></li>
          <li><Link to="/found-items" className={location.pathname === "/found-items" ? "active" : ""}>Found Items</Link></li>
          <li><Link to="/post-item" className={location.pathname === "/post-item" ? "active" : ""}>Post an Item</Link></li>
          <li><Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About</Link></li>
          <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact</Link></li>
        </ul>

        {/* Right: Notifications & Profile */}
        <div className="nav-actions">

          {/* Notification Icon */}
          <div className="nav-notification" ref={notificationRef}>
            <div className="notification-icon" onClick={handleNotificationClick}>
              {/* SVG Link/Bell Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                height="24px"
                width="24px"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>

              {/* Notification Badge */}
              {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
            </div>

            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">Notifications</div>
                <div className="notification-list">
                  {notificationCount > 0 ? (
                    <div className="notification-item" onClick={() => { setNotificationCount(0); navigate('/chat'); }} style={{ cursor: 'pointer' }}>
                      You have {notificationCount} new message(s). Click to view.
                    </div>
                  ) : (
                    <div className="notification-item">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="nav-profile" ref={dropdownRef}>
            <button className="profile-btn" onClick={() => setOpen(!open)}>
              {currentUser?.firstName || "Profile"}
            </button>

            {open && (
              <div className="profile-dropdown">
                <Link to="/edit-profile" onClick={closeDropdown}>Edit Profile</Link>
                <Link to="/my-items" onClick={closeDropdown}>My Items</Link>
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

      {/* Logout Confirmation Message Box (UI for Logout) */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <h3>Are you sure?</h3>
            <p>Do you really want to log out of your account?</p>
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

export default Nav;