import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import heroImage from "./assets/image.png";
import Nav from "./components/nav";
import Footer from "./components/footer";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="homepage">
      {/* NAVBAR */}
      <Nav />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Find Your Lost Items <br />
            with <span className="highlight">AI-Powered</span> Visual Matching
          </h1>

          <p>
            Upload a photo of a lost or found item and let our AI match it
            instantly Fast, accurate, and free.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/post-item')}>Post a Lost Item</button>
            <button className="btn-primary" onClick={() => navigate('/lost-items')}>View Matches</button>
            <button className="btn-primary" onClick={() => navigate('/chat')}>Messages</button>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="AI matching preview" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="howitworks">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="step-card">
            <div className="icon">⬆</div>
            <h3>Upload</h3>
            <p>Upload a photo of the item (lost or found).</p>
          </div>

          <div className="step-card">
            <div className="icon">⚙</div>
            <h3>AI Analyzes</h3>
            <p>CLIP converts your image into embeddings.</p>
          </div>

          <div className="step-card">
            <div className="icon">🔍</div>
            <h3>Smart Matching</h3>
            <p>The system compares vectors and finds the closest match.</p>
          </div>

          <div className="step-card">
            <div className="icon">🔔</div>
            <h3>Get Notified</h3>
            <p>You receive instant match alerts.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
