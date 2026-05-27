import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./HomePage.css";
import heroImage from "./assets/image.png";
import Nav from "./components/nav";
import Footer from "./components/footer";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "fluent:brain-circuit-20-filled",
      title: "CLIP-Powered AI Matching",
      desc: "Our CLIP model finds the closest visual match no manual tagging required.",
    },
    {
      icon: "mdi:bell-alert",
      title: "Instant Notifications",
      desc: "Get real-time alerts the moment a high-confidence match is found for your lost or found item post.",
    },
    {
      icon: "mdi:shield-lock",
      title: "Secure Messaging",
      desc: "Communicate safely with finders or owners through our built-in encrypted chat, no phone numbers shared.",
    },
    {
      icon: "mdi:tag-multiple",
      title: "Smart Categories",
      desc: "Categorize items as electronics, pets, wallets, keys etc.",
    },
    {
      icon: "mdi:open-source-initiative",
      title: "100% Free & Open Source",
      desc: "No paid APIs. CLIP runs entirely on CPU, making this platform affordable and scalable for everyone.",
    },
  ];

  return (
    <div className="homepage">
      {/* NAVBAR */}
      <Nav />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered · Free · Open Source
          </div>

          <h1>
            Recover Lost Items <br />
            with <span className="highlight">AI Visual</span> Matching
          </h1>

          <p>
            Upload a photo of your lost or found item and let our intelligent AI instantly find the best visual match. Fast, accurate, and completely free.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/post-item")}>
              🔍 &nbsp;Post an Item
            </button>
            <button className="btn-outline" onClick={() => navigate("/matches")}>
              View Matches
            </button>
            <button className="btn-outline" onClick={() => navigate("/chat")}>
              Messages
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-chip">
              <span className="stat-num">CLIP</span>
              <span className="stat-label">AI Model</span>
            </div>
            <div className="stat-chip">
              <span className="stat-num">∞</span>
              <span className="stat-label">Free Usage</span>
            </div>
            <div className="stat-chip">
              <span className="stat-num"><Icon icon="mdi:lightning-bolt" style={{verticalAlign:'middle'}} /></span>
              <span className="stat-label">Real-time Alerts</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-wrapper">
            <img src={heroImage} alt="AI-powered Lost and Found matching preview" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="howitworks">
        <span className="section-label">How It Works</span>
        <h2>Four Simple Steps</h2>
        <p className="section-sub">
          From upload to match — our AI handles everything automatically.
        </p>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="icon"><Icon icon="mdi:camera-plus" width="32" height="32" /></div>
            <h3>Upload</h3>
            <p>Take or upload a photo of the lost or found item along with optional tags and location.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="icon"><Icon icon="fluent:brain-circuit-20-filled" width="32" height="32" /></div>
            <h3>AI Analyzes</h3>
            <p>CLIP converts your image into a high-dimensional vector embedding for comparison.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="icon"><Icon icon="mdi:magnify-scan" width="32" height="32" /></div>
            <h3>Smart Match</h3>
            <p>The system ranks all posts by cosine similarity and surfaces the top visual matches.</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="icon"><Icon icon="mdi:bell-ring" width="32" height="32" /></div>
            <h3>Get Notified</h3>
            <p>Receive an instant alert when a high-confidence match exceeds the threshold.</p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stats-item">
            <span className="stats-num">1</span>
            <span className="stats-desc">AI Model (CLIP)</span>
          </div>
          <div className="stats-item">
            <span className="stats-num">0$</span>
            <span className="stats-desc">Cost to Use</span>
          </div>
          <div className="stats-item">
            <span className="stats-num">CPU</span>
            <span className="stats-desc">No GPU Needed</span>
          </div>
          <div className="stats-item">
            <span className="stats-num">∞</span>
            <span className="stats-desc">Items Supported</span>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="features-header">
          <span className="section-label">Features</span>
          <h2>Everything You Need</h2>
          <p>
            A complete platform built for speed, accuracy, and simplicity — powered by one open-source AI model.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon-wrap"><Icon icon={f.icon} width="28" height="28" /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <span className="section-label">Quick Actions</span>
          <h2>What Would You <br />Like to Do?</h2>
          <p>
            Post a new item, browse the latest matches, or jump straight into chat to connect with someone.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate("/post-item")}>
              Post an Item
            </button>
            <button className="btn-outline" onClick={() => navigate("/lost-items")}>
              Browse Lost Items
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
