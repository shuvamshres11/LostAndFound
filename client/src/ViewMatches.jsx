import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import Footer from './components/footer.jsx';
import './lostitems.css'; // Reusing layout
import { useToast } from './components/ToastContext.jsx';

const ViewMatches = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchMyItems = async () => {
      try {
        const userId = currentUser.id || currentUser._id;
        const response = await fetch(`http://localhost:5000/api/matches/my-items/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch your items");
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        showToast("Error fetching items", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [currentUser ? (currentUser.id || currentUser._id) : null]);

  return (
    <div className="full-page-wrapper">
      {currentUser ? <Nav /> : <LandingNav />}
      <main className="content-container">
        <header className="page-header">
          <h1>My Uploads</h1>
          <p style={{color: "#666", marginTop: "10px"}}>
             Select one of your active items below to view its personalized AI Matches.
          </p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', gridColumn: '1 / -1' }}>
            <h2>Loading Items...</h2>
          </div>
        ) : (
          <div className="item-grid">
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666', gridColumn: '1 / -1', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ccc' }}>
                <h3 style={{ marginBottom: '10px' }}>No Active Items Found</h3>
                <p>You haven't uploaded any items that can be matched yet.</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className="item-card" style={{ position: 'relative', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                  
                  <div className="image-container">
                    <img src={item.image} alt={item.title} className="item-image" />
                    <span className={`status-badge ${item.type === 'lost' ? 'lost' : 'found'}`}>
                       {item.type}
                    </span>
                  </div>
                  
                  <div className="card-content">
                    <div className="title-row">
                       <h3>{item.title}</h3>
                    </div>
                    
                    <div className="info-row">
                      <span className="icon">📂</span>
                      <span>{item.category}</span>
                    </div>
                    <div className="info-row">
                      <span className="icon">📍</span>
                      <span>{item.location}</span>
                    </div>

                    <p className="posted-by" style={{margin: '10px 0'}}>
                      Posted {new Date(item.date).toLocaleDateString()}
                    </p>

                    <Link to={`/matches/${item._id}`} style={{
                      display: 'block', 
                      textAlign: 'center', 
                      background: 'linear-gradient(135deg, #00B1A8, #007c77)',
                      color: '#fff',
                      fontWeight: '700',
                      padding: '12px 0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      marginTop: '20px',
                      boxShadow: '0 4px 10px rgba(0, 177, 168, 0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      View AI Matches ✨
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ViewMatches;
