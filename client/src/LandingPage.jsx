import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // Reusing homepage styles
import heroImage from "./assets/image.png";
import LandingNav from "./components/LandingNav";
import Footer from "./components/footer";

export default function LandingPage() {
    const navigate = useNavigate();

    const handleActionClick = () => {
        // Redirect to login if user tries to do anything
        navigate("/login");
    };

    return (
        <div className="homepage">
            {/* LANDING NAVBAR */}
            <LandingNav />

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
                        <button className="btn-primary" onClick={handleActionClick}>Post a Lost Item</button>
                        <button className="btn-outline" onClick={handleActionClick}>View Matches</button>
                        <button className="btn-outline" onClick={handleActionClick}>Messages</button>
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
