import React from 'react';
import Nav from './components/nav.jsx';
import Footer from './components/footer'; // Import Footer
import './about.css';

const About = () => {
  return (
    <div className="about-page-wrapper">
      <Nav />
      <main className="about-content">
        <div className="about-text-column">
          <h1>About Lost & Found Tracker</h1>
          <h3>Intelligent, AI-Powered Lost & Found Solution.</h3>
          <p>
            Lost & Found Tracker uses advanced AI models to match lost items with their
            found counterparts accurately. Our platform intelligently analyzes uploaded
            photos and uses visual matching to rank the possible matches, helping
            people retrieve their lost belongings faster.
          </p>
          <ul className="feature-list">
            <li><span className="check">✔</span> AI image matching for accurate results</li>
            <li><span className="check">✔</span> Alerts for exact matches</li>
            <li><span className="check">✔</span> Safe platform for communication</li>
          </ul>
        </div>
        <div className="about-image-column">
          {/* Replace with your actual path, e.g., src="/assets/about-mockup.png" */}
          <img src="https://aarp.widen.net/content/ivbswqnrrn/jpeg/TrackItems.jpg?crop=true&anchor=0,0&q=80&color=ffffffff&u=5jvmea&w=1140&h=655" alt="Platform Mockup" className="mockup-img" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;