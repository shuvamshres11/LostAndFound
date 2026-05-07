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



        {/* Right: Info */}
        <div className="footer-info">
          <h4>Contact</h4>
          <p>Email: shuvamshres11@gmail.com</p>
          <p>Phone: +977 9800633854</p>
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
