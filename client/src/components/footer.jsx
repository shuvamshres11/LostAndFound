import "./footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left: Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">LOST & FOUND TRACKER</span>
          </div>
          <p className="footer-desc">
            AI-powered platform to connect lost and found items using
            intelligent visual matching.
          </p>
        </div>

        {/* Center: Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/lost-items">Lost Items</Link></li>
            <li><Link to="/found-items">Found Items</Link></li>
            <li><Link to="/post-item">Post an Item</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Right: Info */}
        <div className="footer-info">
          <h4>Contact</h4>
          <p>Email: support@lostfoundtracker.com</p>
          <p>Built with ❤️ using AI & CLIP</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Lost & Found Tracker. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
