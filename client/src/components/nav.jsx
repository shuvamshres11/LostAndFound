import "./nav.css";
import logo from "../assets/lnf_logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import socket from "../socket";

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false); // State for Notifications
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); // Store notification objects
  const [notificationCount, setNotificationCount] = useState(0); // Notification Count (Default 0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State for Logout UI
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser ? (currentUser.id || currentUser._id) : null;

  // Join User Room & Listen for Messages
  useEffect(() => {
    if (userId) {
      socket.emit("join_room", userId);

      // Fetch existing system notifications ONLY on mount or user change
      // We essentially want this to be a separate effect or handled carefully.
      // But keeping it here is fine if dependencies are stable.
      fetch(`http://localhost:5000/api/notifications/${userId}`)
        .then(res => res.json())
        .then(data => {
          setNotifications(data);
          // Reset count to correct number of unread, don't just add
          const unreadCount = data.filter(n => !n.isRead).length;
          setNotificationCount(unreadCount);
        })
        .catch(err => console.error("Error fetching notifications", err));

      const handleReceiveMessage = (message) => {
        // Only increment if we are NOT on the chat page
        if (location.pathname !== '/chat') {
          setNotificationCount(prev => prev + 1);
        }
      };

      const handleReceiveNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setNotificationCount(prev => prev + 1);
      };

      socket.on("receive_message", handleReceiveMessage);
      socket.on("receive_notification", handleReceiveNotification);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("receive_notification", handleReceiveNotification);
      };
    }
  }, [userId, location.pathname]);

  // Handle Search Debounce and Fetching
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/items?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setIsSearchOpen(true);
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
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
  };

  const handleNotificationItemClick = async (notification) => {
    if (!notification.isRead) {
      try {
        // Mark as read in backend
        await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
          method: 'PUT'
        });

        // Update local state
        setNotifications(prev => prev.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setNotificationCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read", err);
      }
    }
  };

  const handleClearAll = async () => {
    try {
      if (!userId) return;

      await fetch(`http://localhost:5000/api/notifications/${userId}/read-all`, {
        method: 'PUT'
      });

      // Mark all as read locally
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (err) {
      console.error("Error clearing notifications", err);
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Left: Logo */}
        <div className="nav-logo">
          <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <img src={logo} alt="Lost & Found" className="nav-logo-img" />
            <div className="logo-text">
              <span className="logo-title">LOST & FOUND</span>
              <span className="logo-sub">&nbsp;TRACKER</span>
            </div>
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

          {/* Search Bar */}
          <div className="nav-search-container" ref={searchRef}>
            <input 
              type="text" 
              className="nav-search-input" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if(searchQuery.trim() !== "") setIsSearchOpen(true); }}
            />
            {isSearchOpen && (
              <div className="search-dropdown-menu">
                 {searchResults.length === 0 ? (
                    <div className="search-no-results">No items found</div>
                 ) : (
                    searchResults.map(item => (
                      <div 
                        key={item._id} 
                        className="search-result-item"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          navigate(`/items/${item._id}`);
                        }}
                      >
                        <div className="search-result-title">{item.title}</div>
                        <div className="search-result-type" style={{ color: item.type?.toLowerCase() === 'lost' ? '#d32f2f' : '#2e7d32', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.type}</div>
                      </div>
                    ))
                 )}
              </div>
            )}
          </div>

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
                <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                  <span>Notifications</span>
                  {notificationCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>

                  {/* Link to Chat */}
                  <div
                    className="notification-item"
                    onClick={() => { setNotificationOpen(false); navigate('/chat'); }}
                    style={{ cursor: 'pointer', fontWeight: '500', borderBottom: '2px solid #f0f0f0', background: '#e3f2fd' }}
                  >
                    💬 Go to Messenger
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                      No system notifications
                    </div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={index}
                        className="notification-item"
                        onClick={() => handleNotificationItemClick(notif)}
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #eee',
                          background: notif.isRead ? 'white' : '#fff8e1',
                          opacity: notif.isRead ? 0.8 : 1,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: notif.type === 'warning' ? '#d32f2f' : '#333' }}>
                          {notif.type.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#333' }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
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
                {currentUser?.role === 'admin' && (
                  <Link to="/admin" onClick={closeDropdown}>Admin Dashboard</Link>
                )}
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